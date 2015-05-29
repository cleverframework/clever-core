'use strict';

// Module dependencies.
const mongoose = require('mongoose');
const User = mongoose.model('User');
const async = require('async');
const config = require('clever-core').loadConfig();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const templates = require('../template');
const util = require('../util');

// Send logged user
exports.me = function(req, res) {
  util.sendObjectAsHttpResponse(res, 200, req.user || null);
};

// Find all user
exports.getUsers = function(req, res, next) {
  User.getUsers(req.query.start, req.query.limit)
    .then(util.sendObjectAsHttpResponse.bind(null, res, 200))
    .catch(util.passNext.bind(null, next));
};

// Find user by id
exports.getUserById = function(req, res, next) {
  User.getUserById(req.params.id)
    .then(util.sendObjectAsHttpResponse.bind(null, res, 200))
    .catch(util.passNext.bind(null, next));
};

// Create user
exports.createUser = function(req, res, next) {

  // because we set our user.provider to local our models/user.js validation will always be true
  req.assert('firstName', 'You must enter your first name').notEmpty();
  req.assert('lastName', 'You must enter your last name').notEmpty();
  req.assert('firstName', 'Firstname cannot be more than 32 characters').len(1, 32);
  req.assert('lastName', 'Lastname cannot be more than 32 characters').len(1, 32);
  req.assert('email', 'You must enter a valid email address').isEmail();
  req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
  // req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).json(errors);
  }

  User.createUser(req.body)
    .then(util.sendObjectAsHttpResponse.bind(null, res, 201))
    .catch(util.sendObjectAsHttpResponse.bind(null, res, 400));
};

// Edit user by id
exports.editUserById = function(req, res, next) {

  // Optionals
  req.assert('firstName', 'You must enter your first name').optional().notEmpty();
  req.assert('lastName', 'You must enter your last name').optional().notEmpty();
  req.assert('firstName', 'Firstname cannot be more than 32 characters').optional().len(1, 32);
  req.assert('lastName', 'Lastname cannot be more than 32 characters').optional().len(1, 32);
  req.assert('email', 'You must enter a valid email address').optional().isEmail();
  req.assert('password', 'Password must be between 8-20 characters long').optional().len(8, 20);

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).json(errors);
  }

  User.editUserById(req.params.id, req.body)
    .then(util.sendObjectAsHttpResponse.bind(null, res, 202))
    .catch(util.sendObjectAsHttpResponse.bind(null, res, 400));
};

// Delete user by id
exports.deleteUserById = function(req, res, next) {
  User.deleteUserById(req.params.id)
    .then(util.sendObjectAsHttpResponse.bind(null, res, 202))
    .catch(util.passNext.bind(null, next));
};
