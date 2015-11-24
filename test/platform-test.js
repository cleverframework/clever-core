'use strict'

class CleverCoreMock {
  constructor () {
    // Nothing
  }
}

let chai = require('chai')
let assert = chai.assert
let expect = chai.expect

// Preparing mock
let cleverCoreMockInstance

describe('platform', function () {
  before(function (done) {
    // Running Platform module
    (require('../lib/platform'))(CleverCoreMock)
    cleverCoreMockInstance = new CleverCoreMock()
    done()
  })

  it('should create a platform property', function () {
    expect(cleverCoreMockInstance).to.exist
    assert(cleverCoreMockInstance.platform !== undefined, `platform property does't exists`)
  })

  it('platform property should be an object', function () {
    expect(cleverCoreMockInstance).to.exist
    assert(typeof cleverCoreMockInstance.platform === 'object', `platform property is not an object`)
  })
})
