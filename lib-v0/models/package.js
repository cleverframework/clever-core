'use strict';

// Module dependencies

module.exports = function(database) {
  let Schema = database.connection.Schema;

  // Package Schema
  let PackageSchema = new Schema({
    name: String,
    settings: {},
    updated: {
      type: Date,
      default: Date.now
    }
  });

  database.connection.model('Package', PackageSchema);
};
