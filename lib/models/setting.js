'use strict';

// Module dependencies
const _ = require('lodash');
const Q = require('q');

module.exports = function(db) {

  const mongoose = db;
  const Schema  = db.Schema;

  // Mongoose Error Handling
  function hasErrors(err) {
    if (err) {
      let modelErrors = [];
      switch (err.code) {
        case 11000: {}
        case 11001: {
          modelErrors.push({
            msg: 'Setting key is already in-use',
            param: 'key'
          });
          break;
        }
        default: {
          if (err.errors) {
            for (var x in err.errors) {
              modelErrors.push({
                param: x,
                msg: err.errors[x].message,
                value: err.errors[x].value
              });
            }
          }
        }
      }
      return modelErrors;
    }

    return null;
  }

  // Validations
  function validateUniqueKey(value, callback) {
    let Setting = mongoose.model('Setting');
    Setting.find({
      $and: [{
        email: value
      }, {
        _id: {
          $ne: this._id
        }
      }]
    }, function(err, setting) {
      callback(err || setting.length === 0);
    });
  };

  // Getter
  function escapeProperty(value) {
    return _.escape(value);
  };

  // Schema
  let SettingSchema = new Schema({

    key: {
      type: String,
      required: true,
      unique: true,
      validate: [validateUniqueKey, 'Setting key is already in-use']
    },
    val: {}
  });

  // Virtuals
  SettingSchema.virtual('value').set(function(value) {

    try {
      const firstChar = value.charAt(0);
      const lastChar = value.charAt(value.length - 1);
      if((firstChar === '[' && lastChar === ']') || (firstChar === '{' && lastChar === '}')) {
        this.val = JSON.parse(value);
      } else {
        this.val = value;
      }
    } catch(e) {
      throw new Error('Invalid JSON value. Impossible to parse');
      // this.val = value;
    }

  }).get(function() {
    return (typeof this.val).toLowerCase() === 'string' ? this.val : JSON.stringify(this.val);
  });

  // Pre-save hook
  SettingSchema.pre('save', function(next) {
    next();
  });

  // Static Methods
  SettingSchema.statics = {
    /**
     * CountSettings - return the number of settings
     *
     * @return {Object}
     * @api public
     */
    countSettings: function() {
      const Setting = mongoose.model('Setting');
      const defer = Q.defer();
      Setting.count({}, function(err, nSettings) {
        if (err) return defer.reject(err);
        return defer.resolve(nSettings);
      });
      return defer.promise;
    },

    /**
     * GetSettings - return the list of settings
     *
     * @param {Integer} skip
     * @param {Integer} limit
     * @return {Object}
     * @api public
     */
    getSettings: function(skip, limit) {
      const Setting = mongoose.model('Setting');
      const options = skip && limit ? {skip: skip, limit: limit} : {};
      const defer = Q.defer();
      Setting.find({}, {}, options, function(err, settings) {
        if (err) return defer.reject(err);
        return defer.resolve(settings);
      });
      return defer.promise;
    },

    /**
     * GetSettingById - return the setting matching the id
     *
     * @param {String} id
     * @return {Object}
     * @api public
     */
    getSettingById: function(id) {
      if(!id) throw new Error('Setting.getSettingById: id parameter is mandatory');
      const Setting = mongoose.model('Setting');
      const defer = Q.defer();
      Setting.findOne({_id: id}, function(err, setting) {
        if (err) return defer.reject(err);
        return defer.resolve(setting);
      });
      return defer.promise;
    },

    /**
     * EditSettingById - edit the setting matching the id
     *
     * @param {String} id
     * @return {Object}
     * @api public
     */
    editSettingById: function(id, settingParams) {
      if(!id) throw new Error('Setting.editSettingById: id parameter is mandatory');
      const Setting = mongoose.model('Setting');
      const defer = Q.defer();

      function save(setting) {
        Object.keys(settingParams).forEach(function (key, index) {
          setting[key] = settingParams[key];
        });

        setting.save(function(err) {
          const errors = hasErrors(err);
          if(errors) return defer.reject(errors);
          defer.resolve(setting);
        });
      }

      Setting.getSettingById(id)
        .then(save)
        .catch(function(err) {
          defer.reject(err);
        });

      return defer.promise;
    },

    /**
     * DeleteSettingById - delete the setting matching the id
     *
     * @param {String} id
     * @return {Object}
     * @api public
     */
    deleteSettingById: function(id) {
      if(!id) throw new Error('Setting.deleteSettingById: id parameter is mandatory');
      const Setting = mongoose.model('Setting');
      const defer = Q.defer();
      Setting.remove({_id: id}, function(err, setting) {
        if (err) return defer.reject(err);
        return defer.resolve(setting);
      });
      return defer.promise;
    },

    createSetting: function(settingParams) {
      const defer = Q.defer();
      const Setting = mongoose.model('Setting');

      try {
        const setting = new Setting(settingParams);
        setting.save(function(err) {
          const errors = hasErrors(err);
          if(errors) return defer.reject(errors);
          defer.resolve(setting);
        });
      } catch (e) {
        defer.reject(e);
      }

      return defer.promise;
    }
  }

  // Instance Methods
  SettingSchema.methods = {

    /**
     * @returns {*|Array|Binary|Object}
     */
    toJSON: function() {
      let obj = this.toObject();
      return obj;
    }
  };

  mongoose.model('Setting', SettingSchema);

}
