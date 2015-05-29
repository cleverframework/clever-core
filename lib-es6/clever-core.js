'use strict';

const mongoose = require('mongoose');
const _ = require('lodash');
const Container = require('lazy-dependable').Container;
const async = require('async');
const Q = require('q');
const Schema = mongoose.Schema;
const Platform = require('./platform');
const Config = require('./config');
const Setting = require('./setting');
const PackageList = require('./package-list');
const Util = require('./util')

class CleverCore extends Container {

  constructor() {

    // Initialise
    super();
    this.version = require('../package').version;
    this.active = false;
    this.options = null;
    this.platform = Platform;
    this.packages = null;
    this.exportable_packages_list = null;
    this.packageEnabled = null;


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

    function loadServer(cb) {
      console.log('Loading server...');
      cb();
    }

    function loadPackages(cb) {
      console.log('Loading packages...');
      PackageList.discoverPackages(CleverCore, self.config, function(err, pkgList, exportablePkgList) {

        if(err) return cb(err);

        // Static property
        CleverCore.packages = pkgList;

        // Instance property
        self.packages = pkgList;

        // Exportable packages list
        self.exportable_packages_list = exportablePkgList;

        //self.app.get('/_getPackages', function(req, res, next) {
          //res.json(self.exportable_packages_list);
        //});

        cb();

      })

    }

    async.series([
      loadConfig,
      loadDatabase,
      loadSettings,
      loadServer,
      loadPackages
    ], function(err) {
      if(err) throw err;
      console.log('Core Loaded!')
    })

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
  };

  static getInstance() {
    if(!CleverCore.singleton) {
      CleverCore.singleton = new CleverCore();
    }
    return CleverCore.singleton;
  }

}

// Static lets
CleverCore.signleton = null;
CleverCore.Package = null;

module.exports = CleverCore;
