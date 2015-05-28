'use strict';

const fs = require('fs');
const _ = require('lodash');
const glob = require('glob');
const path = require('path');

class Util {

  // recursively walk modules path and callback for each file
  static walk(wpath, type, excludeDir, callback) {
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
  static preload(gpath, type) {
    glob.sync(gpath).forEach(function(file) {
      walk(file, type, null, require);
    });
  }

  // flatten json
  static jsonFlatten(data, options) {
    const result = {};

    function layerRoot(root, layer) {
      return (root ? root + '.' : '') + layer;
    }

    function flatten(config, root) {
      for (let index in config) {
        if (config[index] && !config[index].value && typeof(config[index]) === 'object') {
          flatten(config[index], layerRoot(root, index));
        } else {
          result[layerRoot(root, index)] = {
            'value': config[index]
          };

          if (options['default']) {
            result[layerRoot(root, index)]['default'] = config[index];
          }
        }
      }
    }

    flatten(data, '');

    return result;
  }

  // unflatten json
  static jsonUnflatten(data) {
    if (Object(data) !== data || Array.isArray(data)) return data

    const regex = /\.?([^.\[\]]+)|\[(\d+)\]/g;
    const resultholder = {};

    for (let p in data) {
      let cur = resultholder;
      let prop = '';

      while ((let m = regex.exec(p))) {
        cur = cur[prop] || (cur[prop] = (m[2] ? [] : {}));
        prop = m[2] || m[1];
      }

      cur[prop] = data[p];
    }

    return resultholder[''] || resultholder;
  }

  // inherit objs
  static inherit(a, b) {
    a.prototype = Object.create(b.prototype, {
      constructor: {
        value: a,
        writable: false,
        enumerable: false,
        configurable: false
      }
    });
  }

}

module.exports = Util;
