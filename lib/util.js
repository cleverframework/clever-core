'use strict'

const fs = require('fs')
const _ = require('lodash')

// inherit objs
function inherit(a, b) {
  a.prototype = Object.create(b.prototype, {
    constructor: {
      value: a,
      writable: false,
      enumerable: false,
      configurable: false
    }
  })
}

function packageHasName (targetname, dep) {
  return targetname === dep.name
}

function packageHasName (targetname, dep){
  return targetname === dep.name
}

function escapeProperty (value) {
  return _.escape(value)
}

exports.inherit = inherit
exports.lowerCaseFirstLetter = lowerCaseFirstLetter
exports.packageHasName = packageHasName
exports.escapeProperty = escapeProperty
