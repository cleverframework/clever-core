'use strict';

const mongoose = require('mongoose');

function connect(deferred) {
  const self = this;
  this.resolve('config', function(config) {
    mongoose.set('debug', config.mongoose && config.mongoose.debug);
    const database = mongoose.connect(config.db || '', config.dbOptions || {}, function(err) {
      if (err) {
        console.error('Could not connect to MongoDB. Please ensure mongod is running and restart CLEVER app.');
        deferred.reject(err);
        throw err;
      }

      // Require db models
      require('./models/setting');
      require('./models/package');
      require('./models/file');

      // Register database dependency
      self.database = database;
      self.register('database', database);
      deferred.resolve();
    });
  })
}

module.exports = connect;
