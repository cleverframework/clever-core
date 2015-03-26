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
  Q.all([
    search(_packages, disabled, 'packages/core'),
    search(_packages, disabled, 'packages/contrib')
  ]).done(findPackagesDone.bind(null, cleverCoreInstance, app, defer), findPackagesError.bind(null, defer));
}


// ENABLING PACKAGES

function packageActivator(defers, cleverCoreSingleton, loadedPackage) {
  if(loadedPackage) {
    let defer = Q.defer();
    defers.push(defer);
    loadedPackage.activate();
    cleverCoreSingleton.resolve(loadedPackage.name,defer.resolve.bind(defer));
  }
}

function packageRegistrator(cleverCoreSingleton, loadedPackage) {
  if(loadedPackage) {
    cleverCoreSingleton.exportable_packages_list.push ({
      name:loadedPackage.name,
      angularDependencies: loadedPackage.angularDependencies
    });
  }
}

function onPackagesEnabled(cleverCoreInstance,defer) {
  _packages.traverse(packageRegistrator.bind(null,cleverCoreInstance));
  defer.resolve();
}

function enablePackages(cleverCoreInstance,defer) {
  let defers = [];
  _packages.traverse(packageActivator.bind(null,defers,cleverCoreInstance));
  Q.all(defers).done(onPackagesEnabled.bind(null,cleverCoreInstance,defer));
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

  function requireModel(path) {
    let mdl = require(path);
    if (mdl.register) {CleverCore.applyModels(mdl.register);}
  }

  function Package(name) {
    this.loadedPackage = CleverCore.packages.packageNamed(name);
    if(!this.loadedPackage) {
      // CleverCore.packages.dumpToConsole();
      throw new Error(`Package with name ${name} is not loaded`);
    }
    this.name = lowerCaseFirstLetter(this.loadedPackage.name);
    this.config = CleverCore.getInstance().config;

    // Bootstrap package models
    // util.walk(this.loadedPackage.path('server'), 'model', null, requireModel);
  }

  Package.prototype.render = function(view, opts, cb) {
    swig.renderFile(
      this.loadedPackage.path('server') + '/views/' + view + '.jade', opts, cb);
  };

  Package.prototype.setDefaultTemplate = function(template) {
    CleverCore.getInstance().template = template;
  };

  Package.prototype.routes = function() {
    let args = Array.prototype.slice.call(arguments);
    util.walk(this.loadedPackage.path('server'), 'route', 'middlewares', this.onRoute.bind(this,[this].concat(args)));
  };

  Package.prototype.onRoute = function(args,route) {
    require(route).apply(this, args);
  }

  Package.prototype.register = function(callback) {
    CleverCore.getInstance().register(this.name, callback);
  };

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
    }, function(err, doc) {
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
    }, function(err, doc) {
      if (err) {
        console.log(err);
        return callback(true, 'Failed to retrieve settings');
      }
      return callback(null, doc);
    });
  }


  Package.prototype.settings = function() {

    if (!arguments.length) return;

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

  };

  Package.bootstrapPackages = function(callback) {
    findPackages(enablePackages.bind(null,callback));
  };

  CleverCore.prototype.Package = Package;

}

module.exports = initPackages;
