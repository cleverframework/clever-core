'use strict';

const fs = require('fs');
const Q = require('q');
const _ = require('lodash');
const util = require('./util');

function load(deferred) {

  const isAppFolder = process.cwd().indexOf('app');
  const configPath =  isAppFolder> -1 ? `${process.cwd()}/config/env` : `${process.cwd()}/app/config/env`;

  process.env.NODE_ENV = ~fs.readdirSync(configPath).map(function(file) {
    return file.slice(0, -3);
  }).indexOf(process.env.NODE_ENV) ? process.env.NODE_ENV : 'development';

  // Extend the base configuration in all.js with environment specific configuration
  const config = _.extend(
    require(`${configPath}/all`),
    require(`${configPath}/${process.env.NODE_ENV}`) || {}
  );

  this.config = config;
  this.register('config', config);
  deferred.resolve();

}

module.exports = load;
