'use strict';

let cleverCore = require('../../../index');
let Package = cleverCore.Package;

//Defining the Package
var CarpediemPackage = new Package('carpediem');

// All CLEVER packages require registration
CarpediemPackage.register(function(app, database) {

  return CarpediemPackage;

});
