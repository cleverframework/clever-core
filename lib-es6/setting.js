'use strict';

const fs = require('fs');
const Q = require('q');
const _ = require('lodash');
let Util = require('./util');

class Setting {

  static init(callback) {

    const SettingModel = require('./models/setting');

    function done(params) {
      const settings = {};
      for(let i in params) {
        settings[params[i].key] = params[i].val;
      }
      callback(null, settings);
    }

    SettingModel.getSettings()
      .then(done)
      .catch(function(err) {
        callback(err);
      });

  }

}

module.exports = Setting;
