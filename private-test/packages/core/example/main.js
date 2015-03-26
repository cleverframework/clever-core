'use strict';

let cleverCore = require('../../../../index');
let Package = cleverCore.Package;

//Defining the Package
var ExamplePackage = new Package('example');

// All CLEVER packages require registration
ExamplePackage.register(function(app, database, passport) {

  cleverCore.register('test', function(defaultconfig) {
    console.log('test -> defaultconfig');
  });

  // ExamplePackage.routes(app, auth, database, passport);

  return ExamplePackage;

});
