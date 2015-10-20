'use strict'

const fs = require('fs')
const path = require('path')
const express = require('express')
const jade = require('jade')
const util = require('./util')
const rootPath = path.join(__dirname, '/../../..')

class CleverPackage {

  constructor (cleverCoreInstance, name) {

    this.cleverCoreInstance = cleverCoreInstance

    this.loadedPackage = cleverCoreInstance.pkgList.packageNamed(name)

    if(!this.loadedPackage) {
      throw new Error(`Package with name ${name} is not loaded`)
    }

    this.name = this.loadedPackage.name.toLowerCase()

    this.viewsPath = `${rootPath}/app/packages/${this.name}/views`
    this.assetsPath = `${rootPath}/app/packages/${this.name}/assets/dist`

    // Attach CleverCore to pkg object
    this.CleverCore = this.cleverCoreInstance.getClass()

    // Router mounting  point
    this.mountPoint = null

    // Eventually server module assets folder
    this.cleverCoreInstance.resolve('app', app => {
      app.use(`/public/${this.name}`, express.static(this.assetsPath))
    })

  }

  render (view, opts) {
    return jade.renderFile(`${this.viewsPath}/${view}.jade`, opts)
  }

  attach (options) {
    if (options && options.where) {
      this.mountPoint = options.where
      return this
    }
    throw new Error('Attach method requires `option.where`')
  }

  routes () {

    const args = Array.prototype.slice.call(arguments)
    const pkgRoutesPath = this.loadedPackage.path('routes')

    return new Promise ((yep, nope) => {
      fs.exists(pkgRoutesPath, exists => {
        yep(exists)
      })
    })
    .then(exists => {
      if (!exists) return
      return new Promise((yep, nope) => {
        fs
          .readdir(this.loadedPackage.path('routes'), (err, files) => {
            if (err) return nope(err)
            yep(files)
          })
      })
    })
    .then(files => {
      this.cleverCoreInstance.resolve('app', app => {
        files.forEach(file => {
          app.use(`/${this.mountPoint || this.name}`,
            require(`${pkgRoutesPath}/${file}`)([this].concat(args)))
        })
      })
    })
    .catch(console.error.bind(console))

  }

  register (callback) {
    this.cleverCoreInstance.register(this.name, callback)
  }

  getCleverCore () {
    return this.CleverCore
  }

}


module.exports = CleverPackage
