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

  static onInstanceWaiter(fn) {
    CleverCore.instanceWaiters.push(fn);
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

// Static lets
CleverCore.instanceWaiters = [];
CleverCore.singleton = null;

(require('./clever_route'))(CleverCore);
(require('./platform'))(CleverCore);
(require('./config'))(CleverCore);
(require('./database'))(CleverCore);
(require('./package'))(CleverCore);
(require('./server'))(CleverCore);

module.exports = CleverCore.getInstance();
