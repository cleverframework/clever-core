'use strict';

// Module dependencies
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
