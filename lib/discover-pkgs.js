'use strict'

const path = require('path')
const fs = require('fs')
const PackageList = require('./package-list')
const rootPath = path.join(__dirname, '/../../..')
const appPath = `${rootPath}/app`

function search () {

  const pkgList = new PackageList()
  const pkgsPath = path.join(appPath, 'packages')

  return new Promise((yep, nope) => {
    fs.readdir(pkgsPath,(err, files) => {
      if (err) return nope(err)
      if (!files || files.length === 0) return nope(new Error('No packages found'))
      yep(files)
    })
  })
  .then(files => {
    return Promise.all(files.map(file => {
      return new Promise((yep, nope) => {
        const filePath = path.join(pkgsPath, file, 'package.json');
        fs.readFile(filePath, (err, fileData) => {
          if (err) return nope(err)
          yep(fileData)
        })
      })
      .then(fileData => {
        if (fileData) {
          const json = JSON.parse(fileData.toString())
          if (json.clever) {
            return json
          } else {
            throw new Error(`Pkg ${file} must specify CLEVER version`)
          }
        } else {
          throw Error(`Pkg ${file} has empty package.json file`)
        }
      })
      .then(json => {
        const filePath = path.join(pkgsPath, file, 'clever.json')
        return new Promise((yep, nope) => {
          fs.readFile(filePath, (err, cleverFileData) => {
            if(err) return nope(err)

            const dependable = pkgList.createPackage(json.name, json.version, json.visible)

            if (cleverFileData) {
              const cleverJson = JSON.parse(cleverFileData.toString())
              if (cleverJson.dependencies) {
                dependable.cloneDependencies(cleverJson.dependencies)
              }
              return yep(dependable)
            }

            const emptyFileError = new Error(`Pkg ${file} has empty clever.json file`)
            nope(emptyFileError)
          })
        })
      })
      .then(dependable => {
        return pkgList.add(dependable)
      })
    }))
  })
  .then(() => {
    return pkgList
  })

}

function discoverPackages (yep, nope) {

  this.resolve('config', 'app', (config, app) => {

    search()
      .then(pkgList => {

        if(!pkgList.unresolved.empty()) {
          throw new Error(`Packages with unresolved dependencies: ${pkgList.listOfUnresolved()}`)
        }
        this.pkgList = pkgList
        this.exportablePkgList = []

        // Exports registered packages via JSON API
        app.get('/_getPackages', (req, res, next) => {
          res.json(this.exportablePkgList)
        })

        return pkgList
      })
      .then(pkgList => {
        const activatorPromises = []
        pkgList.traverse(loadedPackage => {
          if(loadedPackage) {
            loadedPackage.activate()
            activatorPromises.push(new Promise((yep, nope) => {
              this.resolve(loadedPackage.name, yep)
            }))
          }
        })

        return Promise
          .all(activatorPromises)
          .then(() => {
            pkgList.traverse(loadedPackage => {
              if(loadedPackage) {
                this.exportablePkgList.push({
                  name: loadedPackage.name,
                  version: loadedPackage.version,
                  visible: loadedPackage.visible
                })
              }
            })
          })
      })
      .then(yep)
      .catch(nope)

  })

}

module.exports = discoverPackages
