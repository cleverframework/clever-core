'use strict';

const fs = require('fs');
const Q = require('q');
const _ = require('lodash');
const util = require('./util');

function loadSettings(deferred) {

  const self = this;
  this.resolve('database', function(database) {
    const Setting = database.model('Setting');
    Setting.getSettings()
      .then(function(params) {
        const settings = {};
        for(let i in params) {
          settings[params[i].key] = params[i].val;
        }
        self.settings = settings;
        self.register('settings', settings);
        deferred.resolve();
      })
      .catch(function(err) {
        console.error(err);
        deferred.reject(err);
      });
  });

}

module.exports = loadSettings;
