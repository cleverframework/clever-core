'use strict'

let express = require('express')
let session = require('express-session')
let cookieParser = require('cookie-parser')
let expressValidator = require('express-validator')
let bodyParser = require('body-parser')
let methodOverride = require('method-override')
let http = require('http')
let fs = require('fs')
let passport = require('passport')


class ServerEngine {

  constructor (cleverCoreInstance, config, database) {

    this.app = null
    this.db = null

    //this.db = database
 
    // Express settings
    const app = express()
    app.useStatic = function(a, b) {
      if('undefined' === typeof b) {
        this.use(express.static(a))
      } else {
        this.use(a,express.static(b))
      }
    }

    this.app = app

    // Register app dependency
    cleverCoreInstance.register('app', () => {

      const config = this.app.config = cleverCoreInstance.config

      this.app.use((req,res,next) => {
        res.setHeader('X-Powered-By','Clever V1')
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

      return this.app

    })

  }

  destroy () {
    this.db = null
    this.app = null
  }

  ready (cb) {
    // Do the last express.app setup, like error handling, etc ..
    return null
  }

  serve (cb) {
    // Listen on http.port
    const httpServer = http.createServer(this.app)
    const config = this.app.config
    httpServer.listen(config.http ? config.http.port : config.port, config.hostname)
    return cb(this.app)
  }

  static createEngine (cleverCoreInstance, config) {
    return new ServerEngine(cleverCoreInstance, config)
  }

}

module.exports = ServerEngine
