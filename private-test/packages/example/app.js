'use strict';

let cleverCore = require('clever-core');
let Module = cleverCore.Module;

//Defining the Package
var UserPackage = new Module('system');

// All CLEVER packages require registration
UserPackage.register(function(app, database, passport) {

  let auth = require('./authorization');
  require('./passport')(passport);

  cleverCore.register('auth', auth);

  UserPackage.routes(app, auth, database, passport);

  return UserPackage;

});
