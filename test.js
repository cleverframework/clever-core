'use strict';

const Q = require('q');

const CleverCore = require('./lib-es6/clever-core');

const c = CleverCore.getInstance();

const Search = require('./lib-es6/search');
const searchSourceForFindPackages = require('./lib/search');

const DependableList = require('./lib/dependablelist');

let _packages = new DependableList();

Search.start(_packages, [], 'packages')
  .then(function() {
    //console.log(_packages)
  })
  .catch(function(err) {
    //console.error(err);
  })

_packages = new DependableList();

searchSourceForFindPackages(_packages, [], 'packages')
  .then(function() {
    //console.log(_packages)
  })
  .catch(function(err) {
    //console.error(err);
  })



// TEST

function eventualAdd(a, b) {
  return Q.spread([a, b], function (a, b) {
    return a + b;
  })
}

const wow = Q.all([
  eventualAdd(2, 2),
  eventualAdd(10, 20)
]).done(function(a) {
  //console.log(a)
}, function(b) {
  //console.log(b)
});
