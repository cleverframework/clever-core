'use strict'

const path = require('path')
const rootPath = path.join(__dirname, '/../../..')

function loadConfig () {
  const config = require(`${rootPath}/app/config`)
  config.rootPath = rootPath
  return config
}

module.exports = loadConfig
