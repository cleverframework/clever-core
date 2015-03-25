'use strict';

let Container = require('lazy-dependable').Container;
let Q = require('q');

class CleverCore extends Container {

  constructor() {
    super(this);
    CleverCore.singleton = this;

    this.version = require('../package').version;
    this.active = false;
    this.options = null;
    
    // TODO: Use Promises to control the Core Flow
    this.instanceWaitersPromise = [];
    while(CleverCore.instanceWaiters.length) {
      let defer = Q.defer();
      CleverCore.instanceWaiters.shift()(this, defer);
      this.instanceWaitersPromise.push(defer.promise);
    }
  }

  loadConfig() {
    return this.config.clean;
  }

/*
  serve(cb) {
    this.resolve('database', (database) => {
      this.serveEngine.beginBootstrap(this, database);
      this.resolve('app', cb);
    });
  }
*/

  static onInstanceWaiter(fn) {
    CleverCore.instanceWaiters.push(fn);
  }

  static getInstance() {
    if(!CleverCore.singleton) {
      CleverCore.singleton = new CleverCore();
    }
    return CleverCore.singleton;
  }

}

// Static vars
CleverCore.instanceWaiters = [];
CleverCore.singleton = null;

(require('./platform'))(CleverCore);
(require('./config'))(CleverCore);
(require('./database'))(CleverCore);
(require('./module'))(CleverCore);
(require('./server'))(CleverCore);

module.exports = CleverCore.getInstance();
