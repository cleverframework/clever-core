'use strict';

const mongoose = require('mongoose');
const _ = require('lodash');
const Container = require('lazy-dependable').Container;
const async = require('async');
const Q = require('q');
const Schema = mongoose.Schema;
const PackageList = require('./package-list');
const ServerEngine = require('./server-engine');
const util = require('./util')

class CleverCore extends Container {

  constructor() {

    // Initialise
    super();
    this.version = require('../package').version;
    this.active = false;
    this.options = null;
    this.platform = require('./platform');
    this.packages = null;
    this.exportable_packages_list = null;
    this.packageEnabled = null;
    this.database = null;
    this.settings = null;
    this.engine = null;

    // Singleton pattern design
    CleverCore.singleton = this;

  }

  loadConfig() {
    return this.config;
  }

  loadSettings() {
    return this.settings;
  }

  packageEnabled(name) {
    function packageHasName(pkg) {
      if(name===pkg.name) {
        return true;
      }
    }
    return this.packages.traverseConditionally(packageHasName) || false;
  }

  serve(options, callback) {

    if(typeof options === 'function') {
      callback = options;
    }

    // this === cleverCoreInstance
    if (this.active) {
      return callback(this);
    }

    const self = this;

    function loadConfig(cb) {
      console.log('Loading configuration...');
      self.config = require('./load-config')();
      self.register('config', self.config);
      cb();
    }

    function loadDatabase(cb) {
      console.log('Loading database...');
      const defaultConfig = self.config;
      mongoose.set('debug', defaultConfig.mongoose && defaultConfig.mongoose.debug);
      const database = mongoose.connect(defaultConfig.db || '', defaultConfig.dbOptions || {}, function(err) {
        if (err) return cb(err);
        // Register database dependency
        self.database = database;
        self.register('database', database);
        cb();
      });
    }

    function loadSettings(cb) {
      console.log('Loading settings...');
      require('./load-settings')(function(err, settings) {
        if(err) return cb(err);
        self.settings = settings;
        self.register('settings', self.settings);
        cb();
      });
    }

    function loadPackages(cb) {
      console.log('Loading packages...');
      CleverCore.Package = require('./discover')(CleverCore, function(err, pkgList, exportablePkgList) {

        if(err) return cb(err);

        // Static property
        CleverCore.packages = pkgList;

        // Instance property
        self.packages = pkgList;

        // Exportable packages list
        self.exportable_packages_list = exportablePkgList;



        cb();

      })

    }

    function loadEngine(cb) {
      console.log('Loading server engine...');
      self.options = options;
      self.active = true;
      self.engine = ServerEngine.createEngine(self.options.serverEngine || self.config.serverEngine);
      self.engine.beginBootstrap(self, self.database);
      self.app.get('/_getPackages', function(req, res, next) {
        res.json(self.exportable_packages_list);
      });
      cb();
    }

    async.series([
      loadConfig,
      loadDatabase,
      loadSettings,
      loadPackages,
      loadEngine
    ], function(err) {
      if(err) throw err;
      // console.log('Core Loaded!');
      //self.engine.endBootstrap(callback);
    })

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
CleverCore.Package = null;

module.exports = CleverCore;
