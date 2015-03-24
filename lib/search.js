let fs = require('fs');
let path = require('path');

function readModuleCleverJSONFile(_modules, fileDefer, dependable, file, source, fileErr, data) {
  let depobj = {};
  if (data) {
    try {
      let json = JSON.parse(data.toString());
      if (json.dependencies) {
        dependable.cloneDependencies(json.dependencies);
      }
    } catch (err) {
      console.log(file,'clever json error',err);
      //fileDefer.reject(err); //don't give up
    }
  }
  _modules.add(dependable);
  fileDefer.resolve();
}

function readModulePackageJSONFile(_modules, fileDefer, file, source, fileErr, data) {
  if (data) {
    try {
      let json = JSON.parse(data.toString());
      if (json.clever) {
        fs.readFile(path.join(process.cwd(), source, file, 'clever.json'), readModuleMeanJSONFileDone.bind(null, _modules, fileDefer, _modules.createModule(json.name,json.version,source), file, source));
        return;
      }
    } catch (err) {
      fileDefer.reject(err);
      return;
    }
    fileDefer.resolve();
  }else{
    fileDefer.resolve();
    //fileDefer.reject(fileErr);
  }
}

function fileForEachProcess (_modules, source, promises, file) {
  let fileDefer = Promise.defer();
  fs.readFile(path.join(process.cwd(), source, file, 'package.json'), readModulePackageJSONFileDone.bind(null, _modules, fileDefer, file, source));
  promises.push(fileDefer.promise);
}

function processDirFilesFromSearchSource(_modules, disabled, source, deferred, err, files) {
  if (err || !files || !files.length) {
    if (err && err.code !== 'ENOENT') {
      console.log(err);
    } else {
      return deferred.resolve();
    }
    return deferred.reject(err);
  }

  let promises = [];
  for (let i in disabled) {
    let index = files.indexOf(i);
    if (index < 0) continue;
    files.splice(index, 1);
  }

  files.forEach(fileForEachProcess.bind(null, _modules, source, promises));
  return deferred.resolve(Promise.all(promises));
}

function searchSourceForFindModules(_modules, disabled, source) {
  let deferred = Promise.defer();
  fs.readdir(path.join(process.cwd(), source), processDirFilesFromSearchSource.bind (null, _modules, disabled, source, deferred));
  return deferred.promise;
}

module.exports = searchSourceForFindModules;
