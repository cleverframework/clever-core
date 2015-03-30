'use strict';

let cleverCore = require('../../../../index');
let Package = cleverCore.Package;

//Defining the Package
var ExamplePackage = new Package('example');

// All CLEVER packages require registration
ExamplePackage.register(function(app, database) {

  ExamplePackage.routes(app, database);

  return ExamplePackage;

});
