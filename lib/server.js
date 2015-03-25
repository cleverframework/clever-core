'use strict';

let Q = require('q');
let path = require('path');
let Chainware = require('./chainware')
let ServerEngine = require('./engine');

function serveWithDB(CleverCore, cb, database) {
  let engine = ServerEngine.createEngine(this.options.serverEngine || this.config.clean.serverEngine);
  engine.beginBootstrap(this, database);

  Q.all(this.instanceWaitersPromise).done(() => {
    // this === cleverCoreInstance
    engine.endBootstrap(cb.bind(null, this));
  });
}

function serve(CleverCore, options, cb) {

  if(typeof options === 'function') {
    cb = options;
  }

  // this === cleverCoreInstance
  if (this.active) {
    return cb(this);
  }
  this.options = options;
  this.active = true;
  this.resolve('database', serveWithDB.bind(this, CleverCore, cb));
}

function onInstance(CleverCore, cleverCoreInstance, defer) {
  CleverCore.prototype.serve = serve.bind(cleverCoreInstance, CleverCore);
  CleverCore.prototype.chainware = new Chainware();
  defer.resolve();
}

function createServer(CleverCore) {
  CleverCore.onInstanceWaiter(onInstance.bind(null, CleverCore));
}

module.exports = createServer;
