'use strict';

// Module dependencies
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Statics
const staticMethods = {

  updateSettings(name, settings, callback) {
    const Package = mongoose.model('Package');

    Package.findOneAndUpdate({
      name: name
    }, {
      $set: {
        settings: settings,
      updated: new Date()
      }
    }, {
      upsert: true,
      multi: false
    }, function(err, doc) {
      if (err) {
        console.log(err);
        return callback(true, 'Failed to update settings');
      }
      return callback(null, doc);
    });
  },

  getSettings(name, callback) {
    const Package = mongoose.model('Package');
    
    Package.findOne({
      name: name
    }, function(err, doc) {
      if (err) {
        console.log(err);
        return callback(true, 'Failed to retrieve settings');
      }
      return callback(null, doc);
    });
  }

}

// Package Schema
class PackageSchema extends Schema() {
  constructor() {
    super({
      name: String,
      settings: {},
      updated: {
        type: Date,
        default: Date.now
      }
    });
  }
}

mongoose.model('Package', new PackageSchema());

module.exports = mongoose.model('Package');
