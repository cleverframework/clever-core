let DependableList = require('dependable-list');
let Dependable = DependableList.dependableConstructor();
let path = require('path');

function hasname(targetname,dep){
  return targetname===dep.name;
}

function depChecker(targetdep, depfromlist, depfromlistcontainer){
  targetdep.resolve(depfromlist.name);
  if(targetdep.resolved()){
    return depfromlistcontainer;
  }
}

function addToListOfUnresolved(lobj,unres){
  lobj.list.push(unres.name);
}

class Module extends Dependable {
  constructor(name,version,source) {
    super();
    this.name = name;
    this.version = version;
    this.source = source;
  }

  destroy() {
    super.destroy()
    this.source = null;
    this.version = null;
    this.name = null;
  }

  path(extra) {
    return path.join(process.cwd(), this.source, this.name, extra);
  }

  activate() {
    let req = require(this.path('app.js'));
    if(req && 'function' === req.init) {
      // app.js of a package may export the init function
      // to learn about its name, source, dependencies
      req.init(this);
    }
  }
}

class ModuleList extends DependableList {
  constructor() {
    // super();
  }

  dependableConstructor() {
    return Module;
  }

  createModule(name, version, source) {
    return new Module(name, version, source);
  }

  moduleNamed(name) {
    return this.findOne(hasname.bind(null,name));
  }
}

module.exports = ModuleList;
