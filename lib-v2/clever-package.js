'use strict';

const fs = require('fs');
const path = require('path');
const Q = require('q');
const express = require('express');
const _ = require('lodash');
const jade = require('jade');
const util = require('./util');

function requireModel(path) {
  let mdl = require(path);
  if (mdl.register) {
    CleverCore.applyModels(mdl.register);
  }
}

function attachPackageClass() {
  console.log(1)
  const cleverCoreInstance = this;

  class Package {
    constructor(name) {
      console.log(2)

      try {
        this.loadedPackage = cleverCoreInstance.pkgList.packageNamed(name);
      } catch(e) {
        console.error(new Error(e));
      }

      if(!this.loadedPackage) {
        throw new Error(`Package with name ${name} is not loaded`);
      }
      console.log(3)
      this.name = util.lowerCaseFirstLetter(this.loadedPackage.name);
      this.config = cleverCoreInstance.config;
      this.viewsPath = `${this.config.root}/packages/${this.name}/views`;
      this.assetsPath = `${this.config.root}/packages/${this.name}/assets/dist`;
      console.log(4)
      // automatically load models
      util.walk(this.loadedPackage.path('./'), 'model', null, requireModel);
      console.log(5)
      // attach clever core to pkg object
      this.CleverCore = cleverCoreInstance.getClass();

      const self = this;

      // server assets folder
      cleverCoreInstance.resolve('app', function(app) {
        app.use(`/public/${self.name}`, express.static(self.assetsPath));
        console.log(99)
      });
      console.log(6)
    }

    render(view, opts) {
      return jade.renderFile(`${this.viewsPath}/${view}.jade`, opts)
    }

    routes() {
      const args = Array.prototype.slice.call(arguments);
      util.walk(this.loadedPackage.path('./'), 'route', null, this.onRoute.bind(this, [this].concat(args)));
    }

    onRoute(args, route) {
      cleverCoreInstance.resolve('app', this.requireRoute.bind(this, args, route));
    }

    requireRoute(args, route, app) {
      const cleverRoute = require(route).apply(this, args);
      let mountPoint = cleverRoute.type === 'site' ? `${cleverRoute.mountOnRoot ? `/` : ``}` : `/${cleverRoute.type}`;
      mountPoint = cleverRoute.mountOnRoot ? mountPoint : `${mountPoint}/${this.name}`;

      app.use(mountPoint,  cleverRoute.router);
    }

    register(callback) {
      cleverCoreInstance.register(this.name, callback);
    }

    settings() {

      if (!arguments.length) {
        return;
      }

      let database = cleverCoreInstance.get('database');
      if (!database) {
        return {
          err: true,
          message: 'No database connection'
        };
      }

      if (!database.models.Package) {
        require('./models/package');
      }

      const Package = database.model('Package');
      if (arguments.length === 2) return Package.updateSettings(this.name, arguments[0], arguments[1]);
      if (arguments.length === 1 && typeof arguments[0] === 'object') return Package.updateSettings(this.name, arguments[0], function() {});
      if (arguments.length === 1 && typeof arguments[0] === 'function') return Package.getSettings(this.name, arguments[0]);

    }

    getCleverCore() {
      return this.CleverCore;
    }
  }

  cleverCoreInstance.Package = Package;

}

module.exports = attachPackageClass;
