'use strict';

const fs = require('fs');
const Q = require('q');
const _ = require('lodash');
const util = require('./util');

function loadSettings(callback) {

  const Setting = require('./models/setting');

  function done(params) {
    const settings = {};
    for(let i in params) {
      settings[params[i].key] = params[i].val;
    }
    callback(null, settings);
  }

  Setting.getSettings()
    .then(done)
    .catch(function(err) {
      callback(err);
    });

}

module.exports = loadSettings;
