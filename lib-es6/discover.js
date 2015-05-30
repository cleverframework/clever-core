'use strict';

const fs = require('fs');
const path = require('path');
const Q = require('q');
const express = require('express');
const _ = require('lodash');
const jade = require('jade');
const search = require('./search');
const util = require('./util');
const PackageList = require('./package-list');

function discoverPackages(CleverCore, cb) {

  const cleverCoreInstance = CleverCore.getInstance();
  const config = cleverCoreInstance;
  const disabled = _.toArray(config.disabledPackages);
  const pkgList = new PackageList();
  const exportable_packages_list = [];
  const loadedPkgs = []; // not used

  // CleverCore.Package = PackageFactory.make(CleverCore, pkgList);

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
        cleverCoreInstance.resolve(loadedPackage.name, defer.resolve.bind(defer));
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
    cb(err);
  }

  Q.all([
    search(pkgList, disabled, 'packages'),
    search(pkgList, disabled, 'packages/core'), // just in case
    search(pkgList, disabled, 'packages/contrib') // just in case
  ]).done(doneWithSuccess, doneWithErrors);

  return require('./package')(CleverCore, pkgList);

}

module.exports = discoverPackages;
