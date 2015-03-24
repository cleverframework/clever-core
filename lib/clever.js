'use strict';

let Container = require('lazy-dependable').Container;
let Platform = require('./platform');
let Module = require('./module');
let Config = require('./config');
let ServeEngine = require('./engine');

let instance = null;

class CleverCore extends Container {

  constructor() {
    super(this);
    this.platform = new Platform();
    this.Config = new Config();
    this.Module = new Module();
    this.ServeEngine = new ServeEngine(this.Config.clean.serverEngine);

    instance = this;
  }

  loadConfig() {
    return this.Config.clean;
  }

  serve() {
    this.resolve('database', (database) => {
      this.ServeEngine.beginBootstrap(this, database);
    });
  }

  static getInstance() {
    if(!instance) {
      instance = new CleverCore();
    }
    return instance;
  }

}

module.exports = CleverCore;
