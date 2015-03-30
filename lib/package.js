'use strict';

let fs = require('fs');
let path = require('path');
let Q = require('q');
let express = require('express');
let _ = require('lodash');
let jade = require('jade');
let search = require('./search');
let util = require('./util');
let DependableList = require('./dependablelist');


// PRIVATE MODULE VARS

let _packages = new DependableList();


// FIND PACKAGES

function findPackagesDone(cleverCoreInstance, app, defer) {
  let config = cleverCoreInstance.config.clean;

  // Exports registered packages via JSON API
  app.get('/_getPackages', getPackagesHandler.bind(null, cleverCoreInstance));

  if(!_packages.unresolved.empty()) {
    throw new Error(`Packages with unresolved dependencies: ${_packages.listOfUnresolved()}`);
  }
  enablePackages(cleverCoreInstance, defer);
}

function findPackagesError (defer, error) {
  console.log('Error loading packages', error);
  defer.resolve();
}

function getPackagesHandler(cleverCoreInstance, req, res, next) {
  res.json(cleverCoreInstance.exportable_packages_list);
}

function findPackages(cleverCoreInstance, defer, app) {
  let disabled = _.toArray(cleverCoreInstance.config.clean.disabledPackages);

  let a = findPackagesDone.bind(null, cleverCoreInstance, app, defer);
  let b = findPackagesError.bind(null, defer);

  Q.all([
    search(_packages, disabled, 'packages'), // just in case
    search(_packages, disabled, 'packages/core'),
    search(_packages, disabled, 'packages/contrib')
  ]).done(a, b);
}


// ENABLING PACKAGES

function packageActivator(defers, cleverCoreInstance, loadedPackage) {
  if(loadedPackage) {
    let defer = Q.defer();
    defers.push(defer);
    loadedPackage.activate();
    cleverCoreInstance.resolve(loadedPackage.name, defer.resolve.bind(defer));
  }
}

function packageRegistrator(cleverCoreInstance, loadedPackage) {
  if(loadedPackage) {
    cleverCoreInstance.exportable_packages_list.push ({
      name: loadedPackage.name,
      version: loadedPackage.version
    });
  }
}

function onPackagesEnabled(cleverCoreInstance, defer) {
  _packages.traverse(packageRegistrator.bind(null, cleverCoreInstance));
  defer.resolve();
}

function enablePackages(cleverCoreInstance, defer) {
  let defers = [];
  _packages.traverse(packageActivator.bind(null, defers, cleverCoreInstance));
  Q.all(defers).done(onPackagesEnabled.bind(null, cleverCoreInstance, defer));
}


// HELPER

function lowerCaseFirstLetter(string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}


// ON INSTANCE

function packageHasName(targetname, pkg) {
  if(targetname===pkg.name) {
    return true;
  }
}

function onInstance(cleverCoreInstance, defer) {
  cleverCoreInstance.resolve('app', findPackages.bind(null, cleverCoreInstance, defer));
}


function initPackages(CleverCore) {

  // Static property
  // TODO: Maybe not need this property statically
  CleverCore.packages = _packages;

  // Instance property
  CleverCore.prototype.packages = CleverCore.packages;

  // Exportable packages list
  CleverCore.prototype.exportable_packages_list = [];

  CleverCore.onInstanceWaiter(onInstance);
  CleverCore.prototype.packageEnabled = function(name) {
    return this.packages.traverseConditionally(packageHasName.bind(null,name)) || false;
  };


  // HELPER

  function requireModel(path) {
    let mdl = require(path);
    if (mdl.register) {
      CleverCore.applyModels(mdl.register);
    }
  }

  function updateSettings(Package, name, settings, callback) {
    Package.findOneAndUpdate({
      name: name
    }, {
      $set: {
        settings: settings,
      updated: new Date()
      }
    }, {
      upsert: true,
      multi: false
    }, (err, doc) => {
      if (err) {
        console.log(err);
        return callback(true, 'Failed to update settings');
      }
      return callback(null, doc);
    });
  }

  function getSettings(Package, name, callback) {
    Package.findOne({
      name: name
    }, (err, doc) => {
      if (err) {
        console.log(err);
        return callback(true, 'Failed to retrieve settings');
      }
      return callback(null, doc);
    });
  }


  // CLASS

  class Package {

    constructor(name) {
      this.loadedPackage = CleverCore.packages.packageNamed(name);
      if(!this.loadedPackage) {
        // CleverCore.packages.dumpToConsole();
        throw new Error(`Package with name ${name} is not loaded`);
      }
      this.name = lowerCaseFirstLetter(this.loadedPackage.name);
      this.config = CleverCore.getInstance().config;

      let viewPath = `${this.config.clean.root}/packages/${this.name}/views`;
      let extendedViewPath = `${this.config.clean.root}/public/${this.name}/views`;
      let assetsPath = `${this.config.clean.root}/packages/${this.name}/assets`;
      let extendedAssetsPath = `${this.config.clean.root}/public/${this.name}/assets`;

      this.viewsPath = fs.existsSync(extendedViewPath) ? extendedViewPath : viewPath;
      this.assetsPath = fs.existsSync(extendedAssetsPath) ? extendedAssetsPath : assetsPath;

      // automatically load models
      this.models();

      // server assets folder
      CleverCore.getInstance().resolve('app', app => {
        app.use(`/public/${this.name}`, express.static(this.assetsPath));
      });

    }

    models() {
      util.walk(this.loadedPackage.path('./'), 'model', null, requireModel);
    }

    render(view, opts) {
      // return `${this.viewsPath}/${view}`;
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
      app.use(`/${this.name}`, require(route).apply(this, args));
    }

    register(callback) {
      CleverCore.getInstance().register(this.name, callback);
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
      if (arguments.length === 1 && typeof arguments[0] === 'object') return updateSettings(Package, this.name, arguments[0], () => {});
      if (arguments.length === 1 && typeof arguments[0] === 'function') return getSettings(Package, this.name, arguments[0]);

    }

    bootstrapPackages(callback) {
      findPackages(enablePackages.bind(null,callback));
    }

  }

  CleverCore.prototype.Package = Package;

}

module.exports = initPackages;
