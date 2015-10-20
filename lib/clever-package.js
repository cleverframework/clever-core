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

    this.waiters = []

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

    // Serve module assets folder
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

  routes (dependencies) {

    const pkgRoutesPath = this.loadedPackage.path('routes')

    const promise = new Promise ((yep, nope) => {
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
      return new Promise(done => {
        this.cleverCoreInstance.resolve('app', app => {
          done(app)
        })
      })
      .then(app => {
        return new Promise(done => {
          this.cleverCoreInstance.resolve(dependencies.concat(() => {
            const args = Array.prototype.slice.call(arguments)
            files.forEach(file => {
              app.use(`/${this.mountPoint || this.name}`,
                require(`${pkgRoutesPath}/${file}`)([this].concat(args)))
            })
            done(this)
          }))
        })
      })
    })

    this.waiters.push(promise)
    return this
  }

  models () {

    const db = this.cleverCoreInstance.db
    const pkgModelsPath = `${rootPath}/app/packages/${this.name}/models`

    const promise = new Promise((yep, nope) => {
      fs
        .exists(pkgModelsPath, exists => {
          yep(exists)
        })
    })
    .then(exists => {
      if (!exists) return Promise.resolve()
      return new Promise((yep, nope) => {
        fs
          .readdir(pkgModelsPath, (err, files) => {
            if (err) return nope(err)
            yep(files)
          })
      })
      .then(files => {
        files.filter(file => {
          return (file.indexOf('.') !== 0) && (file !== 'index.js')
        })
        .forEach(file => {
          const model = db.sequelize.import(path.join(pkgModelsPath, file))
          db[model.name] = model
        })

        Object.keys(db).forEach(modelName => {
          if ('associate' in db[modelName]) {
            db[modelName].associate(db)
          }
        })
      })
    })

    this.waiters.push(promise)
    return this

  }

  register () {
    Promise
      .all(this.waiters)
      .then(() => {
        return this.cleverCoreInstance.register(this.name, this)
      })
      .catch(console.error.bind(console))
  }

  getCleverCore () {
    return this.CleverCore
  }

}


module.exports = CleverPackage
