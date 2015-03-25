let fs = require('fs');
let Q = require('q');
let _ = require('lodash');
let util = require('./util');

function mergeConfig(original, saved) {
  let clean = {};
  for (let index in saved) {
    clean[index] = saved[index].value;
    if (original[index]) {
      original[index].value = saved[index].value;
    } else {
      original[index] = {
        value: saved[index].value
      };
    }
    original[index]['default'] = original[index]['default'] || saved[index]['default'];
  }
  return {
    diff: original,
    clean: clean
  };
}

function loadConfig() {
  // Load configurations
  // Set the node environment letiable if not set before
  let configPath = process.cwd() + '/config/env';
  process.env.NODE_ENV = ~fs.readdirSync(configPath).map(function(file) {
    return file.slice(0, -3);
  }).indexOf(process.env.NODE_ENV) ? process.env.NODE_ENV : 'development';

  // Extend the base configuration in all.js with environment
  // specific configuration
  return _.extend(
    require(`${configPath}/all`),
    require(`${configPath}/${process.env.NODE_ENV}`) || {}
  );
}

class Config {

  constructor(defaultConfig) {
    defaultConfig = defaultConfig || loadConfig();
    this.verbose = {};
    this.original = util.jsonFlatten(defaultConfig, {
      default: true
    });
    this.clean = null;
    this.diff = null;
    this.flat = null;
    this.createConfigurations(defaultConfig);
  }

  createConfigurations(config) {
    let saved = util.jsonFlatten(config, {});
    let merged = mergeConfig(this.original, saved);
    let clean = util.jsonUnflatten(merged.clean, {});
    let diff = util.jsonUnflatten(merged.diff, {});
    this.verbose = {
      clean: clean,
      diff: diff,
      flat: merged
    };
    this.clean = clean;
    this.diff = diff;
    this.flat = merged;
  }

}


function onInstance(CleverCore, cleverCoreInstance, defer){
  // Config.CleverCore = cleverCoreInstance;
  cleverCoreInstance.config = new Config();
  cleverCoreInstance.register('defaultconfig', cleverCoreInstance.config);

  // let loadSettingBind = cleverCoreInstance.config.loadSettings.bind(cleverCoreInstance.config, defer);
  // cleverCoreInstance.resolve('database', loadSettingBind);

  defer.resolve();
}

function initConfig(CleverCore) {
  CleverCore.onInstanceWaiter(onInstance.bind(null, CleverCore));
  CleverCore.Config = Config;
};

module.exports = initConfig;
