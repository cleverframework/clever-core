'use strict'

const express = require('express')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const expressValidator = require('express-validator')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const http = require('http')
const passport = require('passport')
const SequelizeStore = require('connect-session-sequelize')(session.Store)

class ServerEngine {

  constructor (cleverCoreInstance, config, database) {
    this.app = null
    this.db = cleverCoreInstance.db
    this.sessionMiddleware = null

    // Express settings
    const app = express()
    app.useStatic = function (a, b) {
      if (typeof b === 'undefined') {
        this.use(express.static(a))
      } else {
        this.use(a, express.static(b))
      }
    }

    this.app = app

    // Register app dependency
    cleverCoreInstance.register('app', () => {
      const config = this.app.config = cleverCoreInstance.config

      this.app.use((req, res, next) => {
        res.setHeader('X-Powered-By', 'Clever V1')
        next()
      })

      // The cookieParser should be above session
      this.app.use(cookieParser())

      // Request body parsing middleware should be above methodOverride
      this.app.use(expressValidator({ customValidators: {
        isArray (value) {
          return Array.isArray(value)
        }
      }}))
      this.app.use(bodyParser.json())
      this.app.use(bodyParser.urlencoded({
        extended: true
      }))

      this.app.use(methodOverride())

      const csm = config.session.model
      this.db.models[csm.name] =
        this.db.define(csm.name,
          require('./models/session')(this.db.Sequelize), {
            underscored: csm.underscored,
            paranoid: csm.paranoid,
            tableName: csm.tableName
          })

      const pgStore = new SequelizeStore({
        db: this.db,
        table: csm.name
      })

      // Express/PG session storage
      this.app.use(session({
        secret: config.session.secret,
        store: pgStore,
        cookie: config.session.cookie,
        name: config.session.name,
        resave: true,
        saveUninitialized: true,
        proxy: config.session.proxy
      }))

      if (config.auth.passport.enable) {
        this.app.use(passport.initialize())
        this.app.use(passport.session())

        cleverCoreInstance.register('passport', passport)
      }

      require(`${config.rootPath}/app/config/express`)(this.app, config, this.db)

      return this.app
    })
  }

  destroy () {
    this.db = null
    this.app = null
    this.sessionMiddleware = null
  }

  ready (cb) {
    // Do the last express.app setup, like error handling, etc ..
    require(`${this.app.config.rootPath}/app/config/error-handler`).forEach((handler) => {
      this.app.use(handler)
    })
    return null
  }

  serve (cb) {
    // Listen on http.port
    const httpServer = http.createServer(this.app)
    const config = this.app.config
    httpServer.listen(config.app.port, config.app.hostname)

    return cb(this.app)
  }

  static createEngine (cleverCoreInstance, config) {
    return new ServerEngine(cleverCoreInstance, config)
  }

}

module.exports = ServerEngine
