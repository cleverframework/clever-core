'use strict';

let fs = require('fs');
let path = require('path');
let express = require('express');
let _ = require('lodash');

function supportModules(CleverCore) {

  class Module {

    constructor(name) {
      this.name = name;
      this.config = CleverCore.getInstance().config;

      // boostrap routes



      // bootstrap models


    }

    register(callback) {
      CleverCore.getInstance().register(this.name, callback);
    }

  }
}



module.exports = supportModules;
