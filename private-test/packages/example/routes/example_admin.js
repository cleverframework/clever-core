'use strict';

// Dependencies
let router = require('express').Router();

// Require CleverCore
let CleverCore = require('../../../../index');

// Load config
let config = CleverCore.loadConfig();

// Load controller
let exampleAdminCtrl = require('../controllers/example_admin');

// Exports
module.exports = function(ExamplePackage, app, database) {

  router.get('/', exampleAdminCtrl.index.bind(null, ExamplePackage));

  return new CleverCore.CleverRoute(router, 'admin', true);

};
