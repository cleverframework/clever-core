'use strict';

const mongoose = require('mongoose');
const _ = require('lodash');
const Container = require('lazy-dependable').Container;
const async = require('async');
const Q = require('q');
const Platform = require('./platform');
const Config = require('./config');
const Setting = require('./setting')
const Schema = mongoose.Schema;

class CleverCore extends Container {

  constructor() {

    // Initialise
    super();
    this.version = require('../package').version;
    this.active = false;
    this.options = null;
    this.platform = Platform;

    const self = this;

    function loadConfig(cb) {
      console.log('Loading configuration...');
      const config = Config.load();
      self.config = config;
      self.register('config', self.config);
      cb();
    }

    function loadDatabase(cb) {
      console.log('Loading database...');
      let defaultConfig = self.config;
      mongoose.set('debug', defaultConfig.mongoose && defaultConfig.mongoose.debug);
      const database = mongoose.connect(defaultConfig.db || '', defaultConfig.dbOptions || {}, function(err) {
        if (err) return cb(err);
        // Register database dependency
        self.register('database', database);
        cb();
      });
    }

    function loadSettings(cb) {
      console.log('Loading settings...');
      Setting.init(function(err, settings) {
        if(err) return cb(err);
        self.settings = settings;
        console.log(settings)
        self.register('settings', self.settings);
        cb();
      });
    }

    function loadPackages(cb) {
      console.log('Loading packages...');
      cb();
    }

    function loadServer(cb) {
      console.log('Loading server...');
      cb();
    }

    async.series([
      loadConfig,
      loadDatabase,
      loadSettings,
      loadPackages,
      loadServer
    ], function(err) {
      if(err) throw err;
      console.log('Core Loaded!')
    })

    // Singleton pattern design
    CleverCore.singleton = this;

  }

  loadConfig() {
    return this.config.clean;
  }

  loadSettings() {
    return this.settings.clean;
  }

  static getInstance() {
    if(!CleverCore.singleton) {
      CleverCore.singleton = new CleverCore();
    }
    return CleverCore.singleton;
  }

}

// Static lets
CleverCore.signleton = null;
CleverCore.instanceWaiters = [];

module.exports = CleverCore;
