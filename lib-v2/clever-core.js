'use strict';

const Q = require('q');
const _ = require('lodash');
const Container = require('lazy-dependable').Container;
const util = require('./util')

class CleverCore extends Container {
  constructor() {
    super();
    this.version = require('../package').version;
    this.active = false;
    this.platform = require('./platform');
    this.packageList = null;
    this.exportablePkgList = null;
    this.config = null;
    this.settings = null;
    this.menus = {};

    // Classes to export
    this.Package = null;
    this.CleverRoute = require('./clever-route');
    this.Menu = require('./menu');

    const waiters = [];
    waiters.push(require('./clever-config').bind(this));
    waiters.push(require('./database').bind(this));
    waiters.push(require('./clever-settings').bind(this));
    waiters.push(require('./discover').bind(this));

    this.waitersPromise = [];
    while(waiters.length) {
      let defer = Q.defer();
      waiters.shift()(defer);
      this.waitersPromise.push(defer.promise);
    }

  }

  packageEnabled(name) {
    return this.packageList.traverseConditionally(util.packageHasName.bind(null,name)) || false;
  }

  serve(options, cb) {

    if(typeof options === 'function') {
      cb = options;
    }

    // this === cleverCoreInstance
    if (this.active) {
      return cb(this);
    }
    this.options = options;
    this.active = true;
    this.resolve('database', 'settings', require('./server').bind(this, cb));
  }

  loadConfig() {
    return this.config;
  }

  loadSettings() {
    return this.settings;
  }

  getClass() {
    return CleverCore;
  }

  static getInstance() {
    if(!CleverCore.singleton) {
      CleverCore.singleton = new CleverCore();
    }
    return CleverCore.singleton;
  }
}

// Static property
CleverCore.signleton = null;

module.exports = CleverCore;
