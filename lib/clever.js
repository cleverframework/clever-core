'use strict';

let Container = require('lazy-dependable').Container;
let instance = null;

class CleverCore extends Container {

  constructor() {
    super(this);
    instance = this;
    (require('./database'))(this);
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

  static getInstance() {
    if(!instance) {
      instance = new CleverCore();
    }
    return instance;
  }

}

(require('./platform'))(CleverCore);
(require('./config'))(CleverCore);
(require('./module'))(CleverCore);
(require('./engine'))(CleverCore);

module.exports = CleverCore.getInstance();
