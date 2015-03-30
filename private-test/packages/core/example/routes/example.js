'use strict';

// Dependencies
let router = require('express').Router();

// Load config
let config = require('../../../../../index').loadConfig();

// Load controller
let exampleCtrl = require('../controllers/example');

// Exports
module.exports = function(ExamplePackage, app, database) {

  router.get('/', exampleCtrl.index.bind(null, ExamplePackage));

  return router;

};
