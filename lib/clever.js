'use strict';

let Container = require('lazy-dependable').Container;

class CleverCore extends Container {

  constructor() {
    super(this);
    CleverCore.singleton = this;
    (require('./database'))(this);

    // TODO: Use Promises to control the Core Flow
    this.instanceWaitersPromise = [];
    let defer;
    while(CleverCore.instanceWaiters.length) {
      defer = Promise.defer();
      CleverCore.instanceWaiters.shift()(this, defer);
      this.instanceWaitersPromise.push(defer.promise);
    }
  }

  loadConfig() {
    return this.config.clean;
  }

  serve(cb) {
    this.resolve('database', (database) => {
      this.serveEngine.beginBootstrap(this, database);
      this.resolve('app', cb);
    });
  }

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
(require('./module'))(CleverCore);
(require('./engine'))(CleverCore);

module.exports = CleverCore.getInstance();
