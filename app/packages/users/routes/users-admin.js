'use strict';

// Dependencies
let router = require('express').Router();

// Require CleverCore
let CleverCore = require('clever-core');

// Load config
let config = CleverCore.loadConfig();

// Load controller
let usersCtrl = require('../controllers/users-admin');

// Exports
module.exports = function(UserPackage, app, auth, database, passport) {

  // Show registration form
  router.get('/', auth.requiresAdmin, usersCtrl.showUsers.bind(null, UserPackage));

  router.get('/create', auth.requiresAdmin, usersCtrl.createUser.bind(null, UserPackage));

  router.get('/:id', auth.requiresAdmin, usersCtrl.showUser.bind(null, UserPackage));

  router.get('/:id/edit/:opt?', auth.requiresAdmin, usersCtrl.editUser.bind(null, UserPackage));

  return new CleverCore.CleverRoute(router, 'admin', false);

};
