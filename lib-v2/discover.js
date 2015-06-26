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

function discoverPackages(deferred) {

  const cleverCoreInstance = this;

  this.resolve('config', 'app', function(config, app) {

    const disabled = _.toArray(config.disabledPackages);
    const pkgList = new PackageList();
    const exportablePkgList = [];

    cleverCoreInstance.pkgList = pkgList;
    cleverCoreInstance.exportablePkgList = exportablePkgList;
    require('./clever-package').call(cleverCoreInstance);

    function doneWithSuccess() {

      // Exports registered packages via JSON API
      app.get('/_getPackages', function getPackagesHandler(req, res, next) {
        res.json(cleverCoreInstance.exportablePkgList);
      });

      if(!pkgList.unresolved.empty()) {
        throw new Error(`Packages with unresolved dependencies: ${pkgList.listOfUnresolved()}`);
      }

      const defersActivator = [];

      function packageActivator(loadedPackage) {
        if(loadedPackage) {
          const defer = Q.defer();
          defersActivator.push(defer);
          loadedPackage.activate();

          // Not sure why :-)
          cleverCoreInstance.resolve(loadedPackage.name, function (resolvedPkg) {
            defer.resolve();
          });
        }
      }

      pkgList.traverse(packageActivator);

      Q.all(defersActivator).done(function() {

        const defersRegistrator = [];

        function packageRegistrator(loadedPackage) {
          if(loadedPackage) {
            const defer = Q.defer();
            defersRegistrator.push(defer);
            exportablePkgList.push({
              name: loadedPackage.name,
              version: loadedPackage.version,
              visible: loadedPackage.visible
            });
            defer.resolve(); // no async ehm ?
          }
        }

        pkgList.traverse(packageRegistrator);

        Q.all(defersRegistrator).done(function() {
          // Get out of here
          deferred.resolve();
        });

      });

    }

    function doneWithErrors(err) {
      console.error(err);
      deferred.reject(err);
    }

    /*
    Q.all([
      search(pkgList, disabled, 'packages'),
      search(pkgList, disabled, 'packages/core'), // just in case
      search(pkgList, disabled, 'packages/contrib') // just in case
    ]).done(doneWithSuccess, doneWithErrors);
    */

    search(pkgList, disabled, 'packages')
      .then(doneWithSuccess)
      .catch(doneWithErrors);

  });

}

module.exports = discoverPackages;
