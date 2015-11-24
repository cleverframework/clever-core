'use strict'

const Container = require('lazy-dependable').Container
const Sequelize = require('sequelize')
const ServerEngine = require('./server-engine')

class CleverCore extends Container {

  constructor () {
    super()

    this.engine = null
    this.active = false

    const config = require('./config')()
    this.config = config
    this.register('config', config)

    this.db = new Sequelize(config.db)
    this.db.models = {}
    this.db.Sequelize = Sequelize

    this.register('database', this.db)

    this.Package = require('./clever-package').bind(null, this)

    const waiters = []

    // Stuff needs waiting
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

  loadConfig () {
    return this.config
  }

  getClass () {
    return CleverCore
  }

  static getInstance () {
    if (!CleverCore.singleton) {
      CleverCore.singleton = new CleverCore()
    }
    return CleverCore.singleton
  }

}

CleverCore.singleton = null

module.exports = CleverCore
