let fs = require('fs');
let path = require('path');
let Q = require('q');

function readPkgCleverJSONFile(_packages, fileDefer, dependable, file, source, fileErr, data) {
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
  _packages.add(dependable);
  fileDefer.resolve();
}

function readPkgPackageJSONFile(_packages, fileDefer, file, source, fileErr, data) {
  if (data) {
    try {
      let json = JSON.parse(data.toString());
      if (json.clever) {
        let a = path.join(process.cwd(), source, file, 'clever.json');
        let b = _packages.createPackage(json.name, json.version, source);
        let c = readPkgCleverJSONFile.bind(null, _packages, fileDefer, b, file, source)
        return fs.readFile(a, c);
      } else {
        // TODO: hadle better
        return fileDefer.reject(new Error('Pkg must specify CLEVER version'));
      }
    } catch (err) {
      return fileDefer.reject(err);
    }
    fileDefer.resolve();
  } else {
    fileDefer.resolve();
    //fileDefer.reject(fileErr);
  }
}

function fileForEachProcess (_packages, source, promises, file) {
  let fileDefer = Q.defer();
  let filePath = path.join(process.cwd(), source, file, 'package.json');
  let readComplete = readPkgPackageJSONFile.bind(null, _packages, fileDefer, file, source)
  fs.readFile(filePath, readComplete);
  promises.push(fileDefer.promise);
}

function processDirFilesFromSearchSource(_packages, disabled, source, deferred, err, files) {
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

  files.forEach(fileForEachProcess.bind(null, _packages, source, promises));
  return deferred.resolve(Q.all(promises));
}

function searchSourceForFindPackages(_packages, disabled, source) {
  let deferred = Q.defer();
  fs.readdir(path.join(process.cwd(), source), processDirFilesFromSearchSource.bind (null, _packages, disabled, source, deferred));
  return deferred.promise;
}

module.exports = searchSourceForFindPackages;
