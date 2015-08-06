'use strict'

// Module dependencies
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Q = require('q');
const _ = require('lodash');

// Mongoose Error Handling
function hasErrors(err) {
  if (err) {
    const modelErrors = [];
    switch (err.code) {
      case 11000: {};
      case 11001: {
        modelErrors.push({
          msg: 'Setting key is already in-use',
          param: 'key'
        });
        break;
      }
      default: {
        if (err.errors) {
          for (let x in err.errors) {
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

function validateUniqueKey(value, callback) {
  const Setting = mongoose.model('Setting')
  Setting.find({
    $and: [{
      key: value
    }, {
      _id: {
        $ne: this._id
      }
    }]
  }, function(err, setting) {
    callback(err || setting.length === 0);
  })
}

function escapeProperty(value) {
  return _.escape(value);
}


// Statics Methods
const settingSchemaStatics = {
  /**
   * CountSettings - return the number of settings
   *
   * @return {Object}
   * @api public
   */
  countSettings() {
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
  getSettings(skip, limit) {
    const Setting = mongoose.model('Setting');
    const options = skip && limit ? {skip: skip, limit: limit} : {};
    const defer = Q.defer();
    Setting.find({}, {}, options, function(err, settings) {
      if (err) return defer.reject(err);
      return defer.resolve(settings);
    })
    return defer.promise;
  },

  /**
   * GetSettingById - return the setting matching the id
   *
   * @param {String} id
   * @return {Object}
   * @api public
   */
  getSettingById(id) {
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
  editSettingById(id, settingParams) {
    if(!id) throw new Error('Setting.editSettingById: id parameter is mandatory');
    const Setting = mongoose.model('Setting');
    const defer = Q.defer();

    function save(setting) {
      Object.keys(settingParams).forEach(function (key, index) {
        setting[key] = settingParams[key];
      });

      setting.save(function(err) {
        const errors = hasErrors(err)
        if(errors) return defer.reject(errors)
        defer.resolve(setting)
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
  deleteSettingById(id) {
    if(!id) throw new Error('Setting.deleteSettingById: id parameter is mandatory');
    const Setting = mongoose.model('Setting');
    const defer = Q.defer();
    Setting.remove({_id: id}, function(err, setting) {
      if (err) return defer.reject(err);
      return defer.resolve(setting);
    })
    return defer.promise;
  },

  createSetting(settingParams) {
    const defer = Q.defer();
    const Setting = mongoose.model('Setting');

    try {
      const setting = new Setting(settingParams)
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


// Methods
const settingSchemaMethods = {
  /**
   * @returns {*|Array|Binary|Object}
   */
  toJSON () {
    return this.toObject();
  }
}

// Schema
class SettingSchema extends Schema {

  constructor() {
    super({
      key: {
        type: String,
        required: true,
        unique: true,
        validate: [validateUniqueKey, 'Setting key is already in-use']
      },
      val: {}
    });

    // Virtual
    function setValue(value) {

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
      }

    }

    function getValue() {
      return (typeof this.val).toLowerCase() === 'string' ? this.val : JSON.stringify(this.val);
    }

    this.virtual('value').set(setValue).get(getValue);

    this.statics = settingSchemaStatics;
    this.methods = settingSchemaMethods;

  }

}


// init schema
mongoose.model('Setting', new SettingSchema());

// export model
module.exports = mongoose.model('Setting')
