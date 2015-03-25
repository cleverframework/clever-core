'use strict';

let fs = require('fs');
let path = require('path');
let express = require('express');
let _ = require('lodash');
let jade = require('jade');
let search = require('./search');
let util = require('./util');
let DependableList = require('./dependablelist');

let _modules = new DependableList();

function initModules(CleverCore) {

  CleverCore.prototype.modules = _modules;

  class Module {

    constructor(name) {
      this.name = name;
      this.config = CleverCore.getInstance().config;

      // boostrap routes



      // bootstrap models

      console.log('Module' + this.name + 'detected.')


    }

    register(callback) {
      CleverCore.getInstance().register(this.name, callback);
    }

  }

  return Module;

}

module.exports = initModules;
