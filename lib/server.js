'use strict';

let Q = require('q');
let path = require('path');
let ServerEngine = require('./engine');

function serveWithDB(cb, database, settings) {
  let engine = ServerEngine.createEngine(this.options.serverEngine || this.config.serverEngine);
  let self = this;
  engine.beginBootstrap(this, database);

  function _fn() {
    // this === cleverCoreInstance
    engine.endBootstrap(cb.bind(null, this));
  }

  Q.all(this.waitersPromise).done(_fn.bind(this));
}
module.exports = serveWithDB;
