'use strict';

const fs = require('fs');
const path = require('path');
const Q = require('q');

function parseCleverJSON(pkgs, result) {
  if (result.fileData) {
    const json = JSON.parse(result.fileData.toString());
    if (json.dependencies) {
      result.dependable.cloneDependencies(json.dependencies);
    }
  }

  pkgs.add(result.dependable);
}

function readCleverJSON(pkgs, basePath, source, file, json) {
  const defer = Q.defer();
  const filePath = path.join(basePath, source, file, 'clever.json');
  fs.readFile(filePath, function(err, fileData) {
    if(err) return defer.reject(err);
    const result = {};
    result.dependable = pkgs.createPackage(json.name, json.version, json.visible, source);
    result.fileData = fileData;
    defer.resolve(result);
  });
  return defer.promise;
}

function parsePackageJSON(data) {
  if (data) {
    const json = JSON.parse(data.toString());
    if (json.clever) {
      return json;
    } else {
      throw new Error('Pkg must specify CLEVER version');
    }
  } else {
    throw Error('File empty.');
  }
}

function readPackageJSON(basePath, source, file) {
  const defer = Q.defer();
  const filePath = path.join(basePath, source, file, 'package.json');
  fs.readFile(filePath, function(err, fileData) {
    if(err) return defer.reject(err);
    defer.resolve(fileData);
  });
  return defer.promise;
}

exports.parseCleverJSON = parseCleverJSON;
exports.readCleverJSON = readCleverJSON;
exports.parsePackageJSON = parsePackageJSON;
exports.readPackageJSON = readPackageJSON;
