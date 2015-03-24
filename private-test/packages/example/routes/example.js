'use strict';

// User routes use users controller
let exampleCtrl = require('../controllers/example');
let config = require('clever-core').loadConfig();

module.exports = function(ExamplePackage, app, database, ) {

  app.route('/')
    .get(exampleCtrl.index);

};
