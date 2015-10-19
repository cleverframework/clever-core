'use strict'

const _ = require('lodash')
const Container = require('lazy-dependable').Container


class CleverCore extends Container {
  constructor () {

    super()

    const waiters = []
    waiters.push(require('./config').bind(this))
    waiters.push(require('./database').bind(this))

    this.waitersPromise = waiters.map(waiter => {
      return new Promise(waiters.shift())
    })


    // this.config = require(`${rootPath}/app/config`)
    // this.models = models
    //
    // this.models.sequelize
    //   .sync()
    //   .then(() => {
    //
    //   })

  }
}


module.exports = CleverCore.getInstance()
