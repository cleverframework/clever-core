'use strict';

// Dependencies
let router = require('express').Router();

// Require CleverCore
let CleverCore = require('../../../../index');

// Load config
let config = CleverCore.loadConfig();

// Load controller
let exampleApiCtrl = require('../controllers/example-api');

// Exports
module.exports = function(ExamplePackage, app, database) {

  router.get('/', exampleApiCtrl.index.bind(null, ExamplePackage));

  return new CleverCore.CleverRoute(router, 'api', true);

};
