'use strict';

const Search = require('./lib-es6/search');
const searchSourceForFindPackages = require('./lib/search');

const DependableList = require('./lib/dependablelist');

let _packages = new DependableList();

Search.start(_packages, [], 'packages')
  .then(function() {
    console.log(_packages)
  })
  .catch(function(err) {
    console.error(err);
  })

_packages = new DependableList();

searchSourceForFindPackages(_packages, [], 'packages')
  .then(function() {
    console.log(_packages)
  })
  .catch(function(err) {
    console.error(err);
  })
