'use strict';

// Module dependencies
const mongoose = require('mongoose');
const Setting = mongoose.model('Setting');
const async = require('async');
const config = require('clever-core').loadConfig();
const util = require('../util');

// Find all setting
exports.getSettings = function(req, res, next) {
  Setting.getSettings(req.query.start, req.query.limit)
    .then(util.sendObjectAsHttpResponse.bind(null, res, 200))
    .catch(util.passNext.bind(null, next));
};

// Find setting by id
exports.getSettingById = function(req, res, next) {
  Setting.getSettingById(req.params.id)
    .then(util.sendObjectAsHttpResponse.bind(null, res, 200))
    .catch(util.passNext.bind(null, next));
};

// Create setting
exports.createSetting = function(req, res, next) {

  req.assert('key', 'Key is mandatory and cannot be empty').notEmpty();
  req.assert('value', 'Value is mandatory and cannot be empty').notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).json(errors);
  }

  Setting.createSetting(req.body)
    .then(util.sendObjectAsHttpResponse.bind(null, res, 201))
    .catch(util.sendErrorAsHttpResponse.bind(null, res, 400));
};

// Edit setting by id
exports.editSettingById = function(req, res, next) {

  // Optionals
  req.assert('key', 'Key cannot be empty').notEmpty();
  req.assert('value', 'Value cannot be empty').notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).json(errors);
  }

  Setting.editSettingById(req.params.id, req.body)
    .then(util.sendObjectAsHttpResponse.bind(null, res, 202))
    .catch(util.sendErrorAsHttpResponse.bind(null, res, 400));
};

// Delete setting by id
exports.deleteSettingById = function(req, res, next) {
  Setting.deleteSettingById(req.params.id)
    .then(util.sendObjectAsHttpResponse.bind(null, res, 202))
    .catch(util.passNext.bind(null, next));
};
