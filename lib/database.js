'use strict'

const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')

function loadModels (dbUrl) {

  const sequelize = new Sequelize(dbUrl)
  const db = {}

  fs
    .readdirSync(__dirname)
    .filter(file => {
      return (file.indexOf('.') !== 0) && (file !== 'index.js')
    })
    .forEach(file => {
      const model = sequelize.import(path.join(__dirname, file))
      db[model.name] = model
    })

  Object.keys(db).forEach(modelName => {
    if ('associate' in db[modelName]) {
      db[modelName].associate(db)
    }
  })

  db.sequelize = sequelize
  db.Sequelize = Sequelize

  return db

}

function syncDatabase (yep, nope) {
  this.resolve('config', config => {
    const models = require('./models')(config.db)
    models.sequelize
      .sync()
      .then(() => {
        this.models = models
        this.register('database', models)
        yep()
      })
      .catch(nope)
  })
}

module.exports = syncDatabase
