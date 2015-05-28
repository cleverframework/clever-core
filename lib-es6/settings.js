'use strict';

const fs = require('fs');
const Q = require('q');
const _ = require('lodash');
let Util = require('./util');

class Settings {

  static load() {

    const defer = Q.defer();
    const Setting = require('./models/setting');

    Setting.find({}, function(err, settings) {
      if(err) return defer.reject(err);
      defer.resolve(settings);
    });

    return defer.promise;
  }

  static init(callback) {

    function done(params) {
      const settings = {};
      for(let i in params) {
        settings[params[i].key] = params[i].val;
      }
      callback(null, settings);
    }

    Settings.load()
      .then(done)
      .catch(function(err) {
        callback(err);
      });

  }

}

module.exports = Settings;
