'use strict'

const mongoose = require('mongoose');
const fs = require('fs');
const Q = require('q');
const mime = require('mime');
const request = require('request')
const pkgcloud = require('pkgcloud')
const streamBuffers = require('stream-buffers')

/*
 * CLEVER Storage, provides developers object storage. It's easy to use,
 * with a simple interface to store and retrieve any amount of data.
 *
 * It abstracts the application filesystem so that each CLVER module follow the
 * same standard for storing and retrieve data.
 *
 * It currently supports Amazon Simple Storage Service (S3) and the local filesystem.
 */

class Storage {
  constructor(app, strategyName, volumeName, strategyParams, config) {
    const self = this;

    this.strategyName = strategyName;
    this.volumeName = volumeName;
    this.strategyParams = strategyParams;
    this.fs = null;
    this.webServerUrl = null;
    this.config = config

    switch(this.strategyName) {
      case 'local': {
        const LocalFS = require('fs-bindings').FS;
        this.fs = new LocalFS({ rootFolder: this.strategyParams.dir });
        this.webServerUrl = `${app.config.app.url}/storage`;
        app.get('/storage/:bucket/:key', function(req, res, next) {
          // Ignore bucket for the moment
          self.getFile(req.params.key)
            .then(function(fileData) {
              res.header('Content-Type', mime.lookup(req.params.key));
              res.send(fileData);
            });
        });
        break;
      }
      case 'rackspace':
      case 'amazon': {

        this.fs = pkgcloud.storage.createClient(config.cloudStorage[this.strategyName])
        this.webServerUrl = `${app.config.app.url}/storage`;

        app.get('/storage/:bucket/:key', (req, res, next) => {

          // storagePublicUrl: process.env.STORAGE_PUBLIC_URL || '/files',
          // sitePreviewUrl: process.env.SITE_PREVIEW_URL || 'http://localhost:3500',
          // cloudStorage: {
          //   amazon: {
          //     provider: process.env.STORAGE_PROVIDER,
          //     keyId: process.env.STORAGE_KEY_ID,
          //     key: process.env.STORAGE_KEY_SECRET,
          //     region: process.env.STORAGE_REGION
          //   },
          //   rackspace: {
          //     provider: process.env.STORAGE_PROVIDER,
          //     username: process.env.STORAGE_USERNAME,
          //     apiKey: process.env.STORAGE_API_KEY,
          //     region: process.env.STORAGE_REGION
          //   }
          // }

          if (this.strategyName === 'amazon') {
            request(`${config.storagePublicUrl}/${req.params.key}`).pipe(res)
          } else {
            res.status(500).send('Not implemented!')
          }

        });

        break;
      }
      // TODO: aws implementation
      default: {
        throw new Error(`Storage: \`${this.strategyName}\` strategy implementation missing. Use \`local\` instead.`);
      }
    }
  }
  initVolume() {
    const defer = Q.defer();

    if (this.config.env === 'development') {
      this.fs.createBucket({Bucket: this.volumeName}, function(err, res) {
        if(err) return defer.reject(err);
        defer.resolve();
      });
    } else {
      defer.resolve();
    }

    return defer.promise;
  }
  createFile(filename, fileData) {
    const defer = Q.defer();

    if (this.config.env === 'development') {

      this.fs.putObject(fileData, {Bucket: this.volumeName, Key: filename}, function(err, response) {
        if(err) return defer.reject(err);
        defer.resolve();
      });

    } else {

      const myReadableStreamBuffer = new streamBuffers.ReadableStreamBuffer({
        frequency: 10,   // in milliseconds.
        chunkSize: 2048  // in bytes.
      });

      myReadableStreamBuffer.put(fileData);
      myReadableStreamBuffer.stop();

      console.log(filename)

      const writableStream = this.fs.upload({
        container: `${this.config.app.name}-${this.config.env}`,
        remote: filename,
      })

      writableStream.on('error', err => {
        console.error(err)
        defer.reject(err)
      })

      writableStream.on('success', uploadedFile => {
        console.log(uploadedFile)
        defer.resolve()
      })

      myReadableStreamBuffer.pipe(writableStream)
    }

    return defer.promise;
  }
  deleteFile(filename) {
    const defer = Q.defer();

    if (this.config.env === 'development') {
      this.fs.deleteObject({Bucket: this.volumeName, Key: filename}, function(err, response) {
        if(err) return defer.reject(err);
        defer.resolve();
      });
    } else {
      defer.resolve();
    }
    return defer.promise;
  }
  editFile(filename, fileData) {
    // TODO: editFile edit the current file version
    // while createFile, eventually create a new file version
    return this.createFile(filename, fileData);
  }
  getFile(filename) {
    const defer = Q.defer();
    this.fs.getObject({Bucket: this.volumeName, Key: filename}, function(err, obj) {
      if(err) return defer.reject(err);
      defer.resolve(obj.Body);
    });
    return defer.promise;
  }
}

function connect(deferred) {
  const self = this;
  this.resolve('config', 'database', 'app', function(config, database, app) {

    const strategyName = config.storage.strategy;
    const volumeName = config.storage.volumeName;
    const strategyParams = config.storage.strategies[strategyName];

    const storage = new Storage(app, strategyName, volumeName, strategyParams, config);

    // Register storage dependency
    storage.initVolume()
      .then(function() {
        self.storage = storage;
        self.register('storage', storage);
        deferred.resolve();
      })
      .catch(deferred.reject);
  })
}

module.exports = connect;
