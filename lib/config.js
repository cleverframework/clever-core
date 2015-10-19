'use strict'

const path = require('path')
const rootPath = path.join(__dirname, '/../../..')
const models = require('./models')

function loadConfig (resolve, reject) {
  const config = require(`${rootPath}/app/config`)
  config.rootPath = rootPath
  this.config = config
  this.register('config', config)
  resolve()
}

module.exports = loadConfig
