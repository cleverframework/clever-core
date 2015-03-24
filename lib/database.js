'use strict';

let mongoose = require('mongoose');
let _ = require('lodash');
let Schema = mongoose.Schema;

function initDB(cleverCoreInstance) {
  let defaultConfig = cleverCoreInstance.config.clean;
  mongoose.set('debug', defaultConfig.mongoose && defaultConfig.mongoose.debug);
  let database = mongoose.connect(defaultConfig.db || '', defaultConfig.dbOptions || {}, function(err) {
    if (err) {
      console.error('Error:', err.message);
      return console.error('**Could not connect to MongoDB. Please ensure mongod is running and restart CLEVER app.**');
    }

    // Register database dependency
    cleverCoreInstance.register('database', {
      connection:database
    });

  });
}

module.exports = initDB;
