let fs = require('fs');
let path = require('path');
let _ = require('lodash');

class Config {

  static loadConfig() {
    // Load configurations
    // Set the node environment variable if not set before
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

}

function initConfig(cleverCoreInstance) {
  cleverCoreInstance.prototype.config = {
    clean: Config.loadConfig()
  }
};

module.exports = initConfig;
