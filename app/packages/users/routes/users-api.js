'use strict';

// Dependencies
let router = require('express').Router();

// Require CleverCore
let CleverCore = require('clever-core');

// Load config
let config = CleverCore.loadConfig();

// Load controller
let usersApiCtrl = require('../controllers/users-api');

// Exports
module.exports = function(UserPackage, app, auth, database, passport) {

  /*
   * Only JSON-like API
   */

  // TODO: add authorization middleware

  // Return logged user
  router.get('/me', usersApiCtrl.me);

  // Get users
  router.get('/', usersApiCtrl.getUsers);

  // Get user by id
  router.get('/:id', usersApiCtrl.getUserById);

  // Create new user
  router.post('/', auth.requiresAdmin, usersApiCtrl.createUser);

  // Edit user
  router.put('/:id', auth.requiresAdmin, usersApiCtrl.editUserById);

  // Delete user
  router.delete('/:id', auth.requiresAdmin, usersApiCtrl.deleteUserById);

  return new CleverCore.CleverRoute(router, 'api', false);

};
