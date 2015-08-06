'use strict';

const path = require('path');
const DependableList = require('dependable-list');
const Dependable = DependableList.dependableConstructor();
const util = require('./util');



class PackageListElement extends Dependable {
  constructor(name, version, visible, source) {
    super();
    // Dependable.call(this);
    this.name = name;
    this.version = version;
    this.visible = visible;
    this.source = source;
  }

  destroy() {
    super.destroy(this);
    this.source = null;
    this.version = null;
    this.name = null;
    this.visible = null;
  }

  path(end) {
    const basePath = process.cwd().indexOf('app') > -1 ? process.cwd() : `${process.cwd()}/app`;
    return path.join(basePath, this.source, this.name, end);
  }

  activate() {
    const req = require(this.path('main.js'));
    if(req && 'function' === req.init){
      req.init(this);
    }
  }
}

class PackageList extends DependableList {
  dependableConstructor() {
    return PackageListElement;
  }

  createPackage(name, version, visible, source) {
    return new PackageListElement(name, version, visible, source);
  }

  packageNamed(name) {
    return this.findOne(util.packageHasName.bind(null, name));
  }
}

module.exports = PackageList;
