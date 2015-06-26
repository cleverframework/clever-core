'use strict';

const mongoose = require('mongoose');
const fs = require('fs');


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
  constructor(opts) {
    this.strategy = opts;
  }
  createFile() {

  }
  deleteFile() {

  }
  editFile() {
    // TODO
  }
  getFile() {

  }
}

function connect(deferred) {
  const self = this;
  this.resolve('config', 'database', function(config, database) {

    const strategyName = config.storage.strategy;

    const storage = new Storage({
      name: strategyName,
      params: config.storage.strategies[strategyName]
    });

    // Register storage dependency
    self.storage = storage;
    self.register('storage', storage);
    deferred.resolve();

  })
}

module.exports = connect;
