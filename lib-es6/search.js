'use strict';

const fs = require('fs');
const path = require('path');
const Q = require('q');
const async = require('async');
const SearchUtil = require('./search-util')

class Search {

  static start(pkgs, disabled, source) {

    const basePath = process.cwd().indexOf('app') > -1 ? process.cwd() : `${process.cwd()}/app`;
    const dirPath = path.join(basePath, source);
  
    const defer = Q.defer();

    function forEachFile(file, cb) {
      SearchUtil.readPackageJSON(basePath, source, file)
        .then(SearchUtil.parsePackageJSON)
        .then(SearchUtil.readCleverJSON.bind(null, pkgs, basePath, source, file))
        .then(SearchUtil.parseCleverJSON.bind(null, pkgs))
        .then(function() {
          cb();
        })
        .catch(function(err) {
          cb(err);
        });
    }

    fs.readdir(dirPath, function(err, files) {
      if (err || !files || !files.length) {
        if (err && err.code !== 'ENOENT') {
          console.error(err);
        } else {
          return defer.resolve();
        }
        return defer.reject(err);
      }
      async.each(files, forEachFile, function(err) {
        if(err) return defer.reject(err);
        defer.resolve();
      });
    });

    return defer.promise;

  }

}

module.exports = Search;
