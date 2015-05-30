'use strict';

const fs = require('fs');
const path = require('path');
const Q = require('q');
const express = require('express');
const _ = require('lodash');
const jade = require('jade');
const util = require('./util');

function initPackageClass(CleverCore, packages) {

  class Package {

    constructor(name) {
      this.loadedPackage = packages.packageNamed(name);
      if(!this.loadedPackage) {
        // CleverCore.packages.dumpToConsole();
        throw new Error(`Package with name ${name} is not loaded`);
      }
      this.name = util.lowerCaseFirstLetter(this.loadedPackage.name);
      this.config = CleverCore.getInstance().config;
      this.viewsPath = `${this.config.root}/packages/${this.name}/views`;
      this.assetsPath = `${this.config.root}/packages/${this.name}/assets/dist`;

      // automatically load models
      this.models();

      // attach clever core to pkg object
      this.CleverCore = CleverCore;

      // server assets folder
      this.CleverCore.getInstance().resolve('app', this.useStatic.bind(this));

    }

    useStatic(app) {
      app.use(`/public/${this.name}`, express.static(this.assetsPath));
    }

    models() {
      util.walk(this.loadedPackage.path('./'), 'model', null, require);
    }

    render(view, opts) {
      return jade.renderFile(`${this.viewsPath}/${view}.jade`, opts)
    }

    routes() {
      let args = Array.prototype.slice.call(arguments);
      util.walk(this.loadedPackage.path('./'), 'route', null, this.onRoute.bind(this, [this].concat(args)));
    }

    onRoute(args, route) {
      CleverCore.getInstance().resolve('app', this.requireRoute.bind(this, args, route));
    }

    requireRoute(args, route, app) {
      let cleverRoute = require(route).apply(this, args);
      let mountPoint = cleverRoute.type === 'site' ? `${cleverRoute.mountOnRoot ? `/` : ``}` : `/${cleverRoute.type}`;
      mountPoint = cleverRoute.mountOnRoot ? mountPoint : `${mountPoint}/${this.name}`;

      app.use(mountPoint,  cleverRoute.router);
    }

    register(callback) {
      this.CleverCore.getInstance().register(this.name, callback);
    }

    settings() {

      if (!arguments.length) {
        return;
      }

      let database = CleverCore.getInstance().get('database');
      if (!database || !database.connection) {
        return {
          err: true,
          message: 'No database connection'
        };
      }

      if (!database.connection.models.Package) {
        require('./models/package')(database);
      }

      let Package = database.connection.model('Package');
      if (arguments.length === 2) return updateSettings(Package, this.name, arguments[0], arguments[1]);
      if (arguments.length === 1 && typeof arguments[0] === 'object') return updateSettings(Package, this.name, arguments[0], function() {});
      if (arguments.length === 1 && typeof arguments[0] === 'function') return getSettings(Package, this.name, arguments[0]);

    }

    bootstrapPackages(callback) {
      findPackages(enablePackages.bind(null,callback));
    }

    getCleverCore() {
      return this.CleverCore;
    }

  }

  return Package;
}

module.exports = initPackageClass;
