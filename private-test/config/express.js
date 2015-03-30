// globals require
'use strict';

// Module dependencies.
let clever = require('../../index');
let compression = require('compression');
let morgan = require('morgan');
let express = require('express');
let flash = require('connect-flash');
let csrf = require('csurf');

let config = clever.loadConfig();

module.exports = function(app, db) {

  // Adds logging based on logging config in config/env/ entry
  require('./middlewares/logging')(app, config.logging);

  app.set('showStackError', true);

  // Should be placed before express.static
  // To ensure that all assets and data are compressed (utilize bandwidth)
  app.use(compression({
    // Levels are specified in a range of 0 to 9, where-as 0 is
    // no compression and 9 is best compression, but slowest
    level: 9
  }));

  // assign the template engine to .html files
  // app.engine('.html', require('jade').__express);

  // View engine setup
  app.set('view engine', config.templateEngine);

  // Connect flash for flash messages
  app.use(flash());

  // Csfr token
  app.use(csrf());

};
