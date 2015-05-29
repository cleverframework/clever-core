'use strict';

let Package = (require('../../../lib-es6/clever-core')).Package;

// Defining the Package
var SystemPackage = new Package('system');

// All CLEVER packages require registration
SystemPackage.register(function(app, database) {

  return SystemPackage;

});
