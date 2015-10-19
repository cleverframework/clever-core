'use strict'

const path = require('path')
const DependableList = require('dependable-list')
const util = require('./util')
const Dependable = DependableList.dependableConstructor()
const rootPath = path.join(__dirname, '/../../..')

class PackageListElement extends Dependable {
  constructor (name, version, visible, source) {
    super()
    // Dependable.call(this)
    this.name = name
    this.version = version
    this.visible = visible
    this.source = source
  }

  destroy () {
    super.destroy(this)
    this.source = null
    this.version = null
    this.name = null
    this.visible = null
  }

  path (end) {
    return path.join(`${rootPath}/app`, this.source, this.name, end)
  }

  activate () {
    const req = require(this.path('main.js'))
    if(req && 'function' === req.init){
      req.init(this)
    }
  }
}

class PackageList extends DependableList {
  dependableConstructor () {
    return PackageListElement
  }

  createPackage (name, version, visible) {
    return new PackageListElement(name, version, visible, 'packages')
  }

  packageNamed (name) {
    return this.findOne(util.packageHasName.bind(null, name))
  }
}

module.exports = PackageList
