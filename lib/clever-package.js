'use strict'

const fs = require('fs')
const path = require('path')
const express = require('express')
const jade = require('jade')
const CleverCore = require('./clever-core')
const util = require('./util')
const cleverCoreInstance = CleverCore.getInstance()
const rootPath = path.join(__dirname, '/../../..')

class CleverPackage {

  constructor (name) {

    try {
      this.loadedPackage = cleverCoreInstance.pkgList.packageNamed(name)
    } catch(e) {
      console.error(e)
      throw e
    }

    if(!this.loadedPackage) {
      throw new Error(`Package with name ${name} is not loaded`)
    }

    this.name = util.lowerCaseFirstLetter(this.loadedPackage.name)

  }

  attach () {

    this.config = cleverCoreInstance.config

    this.viewsPath = `${rootPath}/app/packages/${this.name}/views`
    this.assetsPath = `${rootPath}/app/packages/${this.name}/assets/dist`

    // Attach CleverCore to pkg object
    this.CleverCore = CleverCore

    // Eventually server module assets folder
    cleverCoreInstance.resolve('app', app => {
      app.use(`/public/${this.name}`, express.static(this.assetsPath))
    })

  }

  render (view, opts) {
    return jade.renderFile(`${this.viewsPath}/${view}.jade`, opts)
  }

  routes () {
    const args = Array.prototype.slice.call(arguments)
    const pkgPath = this.loadedPackage.path('routes')

    return new Promise ((yep, nope) => {
      fs.exists(pkgPath, exists => {
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
      cleverCoreInstance.resolve('app', app => {
        files.forEach(file => {
          app.use(this.name, require(`${pkgPath}/${file}`))
        })
      })
    })

  }

  register (callback) {
    cleverCoreInstance.register(this.name, callback)
  }

  getCleverCore () {
    return this.CleverCore
  }
}


module.exports = Package
