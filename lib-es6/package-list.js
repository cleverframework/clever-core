'use strict';

const fs = require('fs');
const path = require('path');
const Q = require('q');
const express = require('express');
const _ = require('lodash');
const jade = require('jade');
const Search = require('./search');
const Util = require('./util');
const DependableList = require('dependable-list');
const PackageListElement = require('./package-list-element');
const PackageFactory = require('./package-factory');

class PackageList extends DependableList {
  dependableConstructor() {
    return PackageListElement;
  }

  createPackage(name, version, source) {
    return new PackageListElement(name, version, source);
  }

  packageNamed(name) {

    function hasname(targetname, dep){
      return targetname===dep.name;
    }

    return this.findOne(hasname.bind(null, name));
  }

  // STATIC METHODS
  static discoverPackages(CleverCore, config, cb) {

    const cleverCoreInstance = CleverCore.getInstance();
    const disabled = _.toArray(config.disabledPackages);
    const pkgList = new PackageList();
    const exportable_packages_list = [];
    const loadedPkgs = []; // not used

    CleverCore.Package = PackageFactory.make(CleverCore, pkgList);

    function doneWithSuccess() {

      if(!pkgList.unresolved.empty()) {
        cb(new Error (`Packages with unresolved dependencies: ${pkgList.listOfUnresolved()}`));
      }

      const defersActivator = [];

      function packageActivator(loadedPackage) {
        if(loadedPackage) {
          const defer = Q.defer();
          defersActivator.push(defer);
          loadedPackage.activate();

          // Not sure why :-)
          // cleverCoreInstance.resolve(loadedPackage.name, defer.resolve.bind(defer));
        }
      }

      pkgList.traverse(packageActivator);

      Q.all(defersActivator).done(function() {

        const defersRegistrator = [];

        function packageRegistrator(loadedPackage) {
          if(loadedPackage) {
            const defer = Q.defer();
            defersActivator.push(defer);
            exportable_packages_list.push({
              name: loadedPackage.name,
              version: loadedPackage.version
            });
            loadedPkgs.push(loadedPackage);
          }
        }

        pkgList.traverse(packageRegistrator.bind(null, cleverCoreInstance));

        Q.all(defersRegistrator).done(function() {
          // Get out of here
          cb(null, pkgList, exportable_packages_list);
        });

      });

    }

    function doneWithErrors(err) {
      console.log(err)
      cb(err);
    }

    Q.all([
      Search.start(pkgList, disabled, 'packages'),
      Search.start(pkgList, disabled, 'packages/core'), // just in case
      Search.start(pkgList, disabled, 'packages/contrib') // just in case
    ]).done(doneWithSuccess, doneWithErrors);

  }

}

function lowerCaseFirstLetter(string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

function packageHasName(targetname, pkg) {
  if(targetname===pkg.name) {
    return true;
  }
}

module.exports = PackageList;
