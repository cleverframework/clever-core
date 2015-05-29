'use strict';

const DependableList = require('dependable-list');
const Dependable = DependableList.dependableConstructor();
const path = require('path');


class PackageListElement extends Dependable {
  constructor(name, version, source) {
    super();
    // Dependable.call(this);
    this.name = name;
    this.version = version;
    this.source = source;
  }

  destroy() {
    super.destroy(this);
    this.source = null;
    this.version = null;
    this.name = null;
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

module.exports = PackageListElement;
