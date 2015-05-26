'use strict';

let fs = require('fs');
let Q = require('q');
let _ = require('lodash');
let util = require('./util');

function mergeSettings(original, saved) {
  let clean = {};
  for (let index in saved) {
    clean[index] = saved[index].value;
    if (original[index]) {
      original[index].value = saved[index].value;
    } else {
      original[index] = {
        value: saved[index].value
      };
    }
    original[index]['default'] = original[index]['default'] || saved[index]['default'];
  }
  return {
    diff: original,
    clean: clean
  };
}

function loadSettingsFromDB(db) {

  const defer = Q.defer();
  const Setting = db.model('Setting');

  Setting.find({}, function(err, settings) {
    if(err) {
      return defer.reject(err);
    }
    defer.resolve(settings);
  })

  return defer.promise;
}

class Settings {

  constructor(settings) {
    const defaultSettings = settings || {};
    this.verbose = {};
    this.original = util.jsonFlatten(defaultSettings, {
      default: true
    });
    this.clean = null;
    this.diff = null;
    this.flat = null;
    this.createSettings(defaultSettings);
  }

  createSettings(settings) {
    let saved = util.jsonFlatten(settings, {});
    let merged = mergeSettings(this.original, saved);
    let clean = util.jsonUnflatten(merged.clean, {});
    let diff = util.jsonUnflatten(merged.diff, {});
    this.verbose = {
      clean: clean,
      diff: diff,
      flat: merged
    };
    this.clean = clean;
    this.diff = diff;
    this.flat = merged;
  }

}

function loadSettings(cleverCoreInstance, defer, db) {
  // Settings.CleverCore = cleverCoreInstance;

  // Require Core Models
  require('./models/setting')(db.connection);

  loadSettingsFromDB(db.connection)
    .then(function(settings) {
      cleverCoreInstance.settings = new Settings(settings);
      cleverCoreInstance.register('settings', cleverCoreInstance.settings);
      defer.resolve();
    })
    .catch(function(err) {
      defer.reject(err);
    })
}

function onInstance(CleverCore, cleverCoreInstance, defer){
  cleverCoreInstance.resolve('database', loadSettings.bind(null, cleverCoreInstance, defer));
}

function initSettings(CleverCore) {
  CleverCore.onInstanceWaiter(onInstance.bind(null, CleverCore));
};

module.exports = initSettings;
