'use strict';

const fs = require('fs');
const Q = require('q');
const _ = require('lodash');
let Util = require('./util');

class Config {

  static load() {

    const configPath = process.cwd().indexOf('app') > -1 ? `${process.cwd()}/config/env` : `${process.cwd()}/app/config/env`;

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

module.exports = Config;
