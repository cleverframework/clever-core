'use strict';

let mongoose = require('mongoose');
let _ = require('lodash');
let Schema = mongoose.Schema;

function dbConnect(cleverCoreInstance, defer, config) {
  let defaultConfig = config.clean;
  mongoose.set('debug', defaultConfig.mongoose && defaultConfig.mongoose.debug);
  let database = mongoose.connect(defaultConfig.db || '', defaultConfig.dbOptions || {}, function(err) {
    if (err) {
      console.log('Error:', err.message);
      return console.log('Could not connect to MongoDB. Please ensure mongod is running and restart CLEVER app.');
    }

    // Register database dependency
    cleverCoreInstance.register('database', {
      connection:database
    });

    // TODO: Database Promises
    defer.resolve();

  });
}

function onInstance(CleverCore, cleverCoreInstance, defer){
  cleverCoreInstance.resolve('defaultconfig', dbConnect.bind(null, cleverCoreInstance, defer));
}

function initDB(CleverCore) {
  CleverCore.onInstanceWaiter(onInstance.bind(null, CleverCore));
};

module.exports = initDB;
