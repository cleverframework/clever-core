'use strict'

const _ = require('lodash')
const Container = require('lazy-dependable').Container
const Sequelize = require('sequelize')
const ServerEngine = require('./server-engine')
const util = require('./util')

class CleverCore extends Container {

  constructor () {

    super()

    this.engine = null
    this.active = false

    const config = require('./config')()
    this.config = config
    this.register('config', config)

    this.db = {}
    this.db.sequelize = new Sequelize(config.db)
    this.db.Sequelize = Sequelize

    this.Package = require('./clever-package').bind(null, this)

    const waiters = []
    waiters.push(require('./discover-pkgs').bind(this))

    this.waitersPromise = waiters.map(waiter => {
      return new Promise(waiter)
    })

  }

  serve (cb) {

    if (!cb) cb = function () {}

    if (this.active) {
      throw new Error('CleverCore cannot server more than once')
    }

    this.active = true
    this.resolve('config', config => {

      this.engine = ServerEngine.createEngine(this, config)

      Promise
        .all(this.waitersPromise)
        .then(this.engine.ready.bind(this.engine, cb))
        .then(this.engine.serve.bind(this.engine, cb))
        .catch(console.error.bind(console))

    })

  }

  loadConfig() {
    return this.config
  }

  getClass() {
    return CleverCore
  }

  static getInstance() {
    if (!CleverCore.singleton) {
      CleverCore.singleton = new CleverCore()
    }
    return CleverCore.singleton
  }

}

CleverCore.singleton = null

module.exports = CleverCore
