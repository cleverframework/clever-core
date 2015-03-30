'use strict';

// User routes use users controller
let exampleCtrl = require('../controllers/example');
let config = require('../../../../../index').loadConfig();

module.exports = function(ExamplePackage, app, database) {

  app.route('/')
    .get(exampleCtrl.index);

};
