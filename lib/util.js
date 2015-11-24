'use strict'

// inherit objs
function inherit (a, b) {
  a.prototype = Object.create(b.prototype, {
    constructor: {
      value: a,
      writable: false,
      enumerable: false,
      configurable: false
    }
  })
}

function lowerCaseFirstLetter (string) {
  return string.charAt(0).toLowerCase() + string.slice(1)
}

function packageHasName (targetname, dep) {
  return targetname === dep.name
}

exports.inherit = inherit
exports.lowerCaseFirstLetter = lowerCaseFirstLetter
exports.packageHasName = packageHasName
