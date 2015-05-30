'use strict';

const Q = require('q');

const CleverCore = require('./lib-es6/clever-core');

const c = CleverCore.getInstance();

c.serve(function(app) {
  let config = app.config;
  let port = config.https && config.https.port ? config.https.port : config.http.port;
  console.log(`Clever app started on port ${port}`);
});
