let fs = require('fs');
let path = require('path');
let Q = require('q');

function readPackageCleverJSONFile(_packages, fileDefer, dependable, file, source, fileErr, data) {
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

function readPackagePackageJSONFile(_packages, fileDefer, file, source, fileErr, data) {
  if (data) {
    try {
      let json = JSON.parse(data.toString());
      if (json.clever) {
        fs.readFile(path.join(process.cwd(), source, file, 'clever.json'), readPackageCleverJSONFileDone.bind(null, _packages, fileDefer, _packages.createPackage(json.name,json.version,source), file, source));
        return;
      }
    } catch (err) {
      fileDefer.reject(err);
      return;
    }
    fileDefer.resolve();
  } else {
    fileDefer.resolve();
    //fileDefer.reject(fileErr);
  }
}

function fileForEachProcess (_packages, source, promises, file) {
  let fileDefer = Q.defer();
  fs.readFile(path.join(process.cwd(), source, file, 'package.json'), readPackagePackageJSONFileDone.bind(null, _packages, fileDefer, file, source));
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
