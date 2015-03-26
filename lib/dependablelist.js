let DependableList = require('dependable-list');
let Dependable = DependableList.dependableConstructor();
let path = require('path');
let util = require('./util');


// HELPER FUNCTIONS

function hasname(targetname,dep){
  return targetname===dep.name;
}

function depChecker(targetdep,depfromlist,depfromlistcontainer) {
  targetdep.resolve(depfromlist.name);
  if(targetdep.resolved()){
    return depfromlistcontainer;
  }
}

function addToListOfUnresolved(lobj,unres) {
  lobj.list.push(unres.name);
}


// PACKAGELIST

class PackageList extends DependableList {
  constructor() {
    DependableList.call(this);
  }

  dependableConstructor() {
    return Package;
  }

  createPackage(name, version, source) {
    return new Package(name,version,source);
  }

  packageNamed(name) {
    return this.findOne(hasname.bind(null,name));
  }
}


// PACKAGE

class Package extends Dependable {
  constructor(name,version,source) {
    super();
    this.name = name;
    this.version = version;
    this.source = source;
    // Dependable.call(this);
  }

  destroy() {
    super.destroy(this);
    this.source = null;
    this.version = null;
    this.name = null;
  }

  path(extra) {
    return path.join(process.cwd(), this.source, this.name, extra);
  }

  activate() {
    let req = require(this.path('app.js'));
    if(req && 'function' === req.init){
      req.init(this);
    }
  }
}

module.exports = PackageList;
