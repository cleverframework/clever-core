'use strict';

// Dependencies
let router = require('express').Router();

// Require CleverCore
let CleverCore = require('clever-core');

// Load config
let config = CleverCore.loadConfig();

// Load controller
let systemApiCtrl = require('../controllers/system-api');

// Exports
module.exports = function(SystemPackage, app, auth, database, passport) {

  /*
   * Only JSON-like API
   */

  // Get Settings
  router.get('/settings', auth.requiresAdmin, systemApiCtrl.getSettings);

  // Get Setting by id
  router.get('/settings/:id', auth.requiresAdmin, systemApiCtrl.getSettingById);

  // Create new Setting
  router.post('/settings', auth.requiresAdmin, systemApiCtrl.createSetting);

  // Edit Setting
  router.put('/settings/:id', auth.requiresAdmin, systemApiCtrl.editSettingById);

  // Delete Setting
  router.delete('/settings/:id', auth.requiresAdmin, systemApiCtrl.deleteSettingById);

  return new CleverCore.CleverRoute(router, 'api', false);

};
