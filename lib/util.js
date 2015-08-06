'use strict';

const fs = require('fs');
const _ = require('lodash');
const glob = require('glob');
const path = require('path');

// recursively walk modules path and callback for each file
function walk(wpath, type, excludeDir, callback) {
  const baseRgx = /(.*).(js|coffee)$/;
  const rgx = new RegExp('(.*)-' + type + '(s?).(js|coffee)$', 'i');

  if (!fs.existsSync(wpath)) return;

  fs.readdirSync(wpath).forEach(function(file) {
    const newPath = path.join(wpath, file);
    const stat = fs.statSync(newPath);

    if (stat.isFile() && (rgx.test(file) || (baseRgx.test(file)) && ~newPath.indexOf(type))) {
      callback(newPath);
    } else if (stat.isDirectory() && file !== excludeDir && ~newPath.indexOf(type)) {
      walk(newPath, type, excludeDir, callback);
    }
  })
}

// ability to preload requirements for tests
function preload(gpath, type) {
  glob.sync(gpath).forEach(function(file) {
    walk(file, type, null, require);
  });
}

// inherit objs
function inherit(a, b) {
  a.prototype = Object.create(b.prototype, {
    constructor: {
      value: a,
      writable: false,
      enumerable: false,
      configurable: false
    }
  });
}

function lowerCaseFirstLetter(string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

function packageHasName(targetname, dep){
  return targetname===dep.name;
}

function escapeProperty(value) {
  return _.escape(value);
}

exports.walk = walk;
exports.preload = preload;
exports.inherit = inherit;
exports.lowerCaseFirstLetter = lowerCaseFirstLetter;
exports.packageHasName = packageHasName;
exports.escapeProperty = escapeProperty;
