'use strict';

// Dependencies
let router = require('express').Router();

// Require CleverCore
let CleverCore = require('clever-core');

// Load config
let config = CleverCore.loadConfig();

// Load controller
let systemCtrl = require('../controllers/system-admin');

// Exports
module.exports = function(SystemPackage, app, auth, database) {

  // DASHBOARD

  router.get('/', auth.requiresAdmin, systemCtrl.showDashboard.bind(null, SystemPackage));


  // SETTINGS

  router.get('/settings', auth.requiresAdmin, systemCtrl.showSettings.bind(null, SystemPackage));

  router.get('/settings/create', auth.requiresAdmin, systemCtrl.createSetting.bind(null, SystemPackage));

  router.get('/settings/:id', auth.requiresAdmin, systemCtrl.showSetting.bind(null, SystemPackage));  

  router.get('/settings/:id/edit', auth.requiresAdmin, systemCtrl.editSetting.bind(null, SystemPackage));


  // HELP

  router.get('/help', auth.requiresAdmin, systemCtrl.showHelp.bind(null, SystemPackage));

  return new CleverCore.CleverRoute(router, 'admin', true);

};
