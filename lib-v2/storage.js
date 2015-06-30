'use strict';

const mongoose = require('mongoose');
const fs = require('fs');
const Q = require('q');

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
  constructor(strategyName, volumeName, strategyParams) {
    // TODO: aws implementation

    this.strategyName = params.strategyName;
    this.volumeName = params.volumeName;
    this.strategyParams = params.strategyParams;
    this.fs = null;

    switch(this.strategyName) {
      case 'local': {
        const LocalFS = require('fs-bindings').FS;
        this.fs = new LocalFS(this.strategyParams.dir);
        break;
      }
      default: {
        throw new Error(`Storage: \`${this.strategyName}\` strategy implementation missing. Use \`local\` instead.`);
      }
    }
  }
  initVolume() {
    const defer = Q.defer();
    this.fs.createBucket({Bucket: params.volumeName}, function(err, res) {
      if(err) return defer.reject(err);
      defer.resolve();
    });
    return defer.promise;
  }
  createFile(filename, fileData) {
    const defer = Q.defer();
    this.fs.putObject(fileData, {Bucket: this.volumeName, Key: filename}, function(err, response) {
      if(err) return defer.reject(err);
      defer.resolve();
    });
    return defer.promise;
  }
  deleteFile(filename) {
    const defer = Q.defer();
    this.fs.deleteObject({Bucket: this.volumeName, Key: filename}, function(err, response) {
      if(err) return defer.reject(err);
      defer.resolve();
    });
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
  this.resolve('config', 'database', function(config, database) {

    const strategyName = config.storage.strategy;
    const strategyName = config.storage.volumeName;
    const strategyParams = config.storage.strategies[strategyName];

    const storage = new Storage(strategyName, volumeName, strategyParams);

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
