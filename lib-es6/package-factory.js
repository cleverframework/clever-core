'use strict';

const fs = require('fs');
const path = require('path');
const Q = require('q');
const express = require('express');
const _ = require('lodash');
const jade = require('jade');
const Search = require('./search');
const Util = require('./util');
const PackageList = require('./package-list');
const CleverCore = require('./clever-core');

// HELPER// HELPER
function lowerCaseFirstLetter(string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}
function packageHasName(targetname, pkg) {
  if(targetname===pkg.name) {
    return true;
  }
}

// CLASS
class PackageFactory {
  static make(CleverCore, packages) {

    console.log(1)

    class Package {

      // CONSTRUCTOR
      constructor(name) {

        console.log(333)

        this.CleverCore = CleverCore;

        this.loadedPackage = packages.packageNamed(name);
        if(!this.loadedPackage) {
          throw new Error(`Package with name ${name} is not loaded`);
        }

        this.name = lowerCaseFirstLetter(this.loadedPackage.name);
        this.config = CleverCore.getInstance().config;
        this.viewsPath = `${this.config.root}/packages/${this.name}/views`;
        this.assetsPath = `${this.config.root}/packages/${this.name}/assets/dist`;

      }

      useStatic(app) {
        CleverCore.getInstance().app.use(`/public/${this.name}`, express.static(this.assetsPath));
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

        app.use(mountPoint, cleverRoute.router);
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
        console.log('Bootstraping...')
        //findPackages(enablePackages.bind(null,callback));
      }

      getCleverCore() {
        return this.CleverCore;
      }

    }

    return Package;
  }
}

module.exports = PackageFactory;
