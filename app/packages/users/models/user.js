'use strict';

// Module dependencies.
const mongoose = require('mongoose');
const Schema  = mongoose.Schema;
const crypto = require('crypto');
const _ = require('lodash');
const Q = require('q');

// Mongoose Error Handling
function hasErrors(err) {
  if (err) {
    let modelErrors = [];
    switch (err.code) {
      case 11000: {}
      case 11001: {
        modelErrors.push({
          msg: 'Email already used',
          param: 'email'
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
function validatePresenceOf(value) {
  // Don't validate if authenticated by any of the oauth strategies
  return (this.provider && this.provider !== 'local') || (value && value.length);
};

function validateUniqueEmail(value, callback) {
  let User = mongoose.model('User');
  User.find({
    $and: [{
      email: value
    }, {
      _id: {
        $ne: this._id
      }
    }]
  }, function(err, user) {
    callback(err || user.length === 0);
  });
};

// Getter
function escapeProperty(value) {
  return _.escape(value);
};

// Schema
let UserSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    get: escapeProperty
  },
  lastName: {
    type: String,
    required: true,
    get: escapeProperty
  },
  email: {
    type: String,
    required: true,
    unique: true,
    // conforms mostly with RFC2822
    match: [/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please enter a valid email'],
    validate: [validateUniqueEmail, 'E-mail address is already in-use']
  },
  roles: {
    type: Array,
    default: ['authenticated']
  },
  hashed_password: {
    type: String,
    validate: [validatePresenceOf, 'Password cannot be blank']
  },
  provider: {
    type: String,
    default: 'local'
  },
  salt: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  profile: {},
  facebook: {},
  twitter: {},
  github: {},
  google: {},
  linkedin: {}
});

// Virtuals
UserSchema.virtual('password').set(function(password) {
  this._password = password;
  this.salt = this.makeSalt();
  this.hashed_password = this.hashPassword(password);
}).get(function() {
  return this._password;
});

// Pre-save hook
UserSchema.pre('save', function(next) {
  if (this.isNew && this.provider === 'local' && this.password && !this.password.length) {
    return next(new Error('Invalid password'));
  }
  next();
});

// Static Methods
UserSchema.statics = {
  /**
   * CountUsers - return the number of users
   *
   * @return {Object}
   * @api public
   */
  countUsers: function() {
    const User = mongoose.model('User');
    const defer = Q.defer();
    User.count({}, function(err, nUsers) {
      if (err) return defer.reject(err);
      return defer.resolve(nUsers);
    });
    return defer.promise;
  },

  /**
   * GetUsers - return the list of users
   *
   * @param {Integer} skip
   * @param {Integer} limit
   * @return {Object}
   * @api public
   */
  getUsers: function(skip, limit) {
    const User = mongoose.model('User');
    const options = skip && limit ? {skip: skip, limit: limit} : {};
    const defer = Q.defer();
    User.find({}, {}, options, function(err, users) {
      if (err) return defer.reject(err);
      return defer.resolve(users);
    });
    return defer.promise;
  },

  /**
   * GetUserById - return the user matching the id
   *
   * @param {String} id
   * @return {Object}
   * @api public
   */
  getUserById: function(id) {
    if(!id) throw new Error('User.getUserById: id parameter is mandatory');
    const User = mongoose.model('User');
    const defer = Q.defer();
    User.findOne({_id: id}, function(err, user) {
      if (err) return defer.reject(err);
      return defer.resolve(user);
    });
    return defer.promise;
  },

  /**
   * EditUserById - edit the user matching the id
   *
   * @param {String} id
   * @return {Object}
   * @api public
   */
  editUserById: function(id, userParams) {
    if(!id) throw new Error('User.editUserById: id parameter is mandatory');
    const User = mongoose.model('User');
    const defer = Q.defer();

    function save(user) {
      Object.keys(userParams).forEach(function (key, index) {
        if(key==='admin') return; // handle this later
        user[key] = userParams[key];
      });

      // Push 'admin' into user.roles if and only if userParams.admin === 1
      // and user.roles.indexOf('admin') === -1
      // Pull 'admin' from user.roles if userParams.admin !== -1
      // and user.roles.indexOf('admin') > -1
      const adminPos = user.roles.indexOf('admin');

      if(userParams.hasOwnProperty('admin') && adminPos === -1) {
        user.roles.push('admin');
      } else if(!userParams.hasOwnProperty('admin') && adminPos > -1) {
        user.roles.splice(adminPos, 1);
      }

      user.save(function(err) {
        const errors = hasErrors(err);
        if(errors) return defer.reject(errors);
        defer.resolve(user);
      });
    }

    User.getUserById(id)
      .then(save)
      .catch(function(err) {
        defer.reject(err);
      });

    return defer.promise;
  },

  /**
   * DeleteUserById - delete the user matching the id
   *
   * @param {String} id
   * @return {Object}
   * @api public
   */
  deleteUserById: function(id) {
    if(!id) throw new Error('User.deleteUserById: id parameter is mandatory');
    const User = mongoose.model('User');
    const defer = Q.defer();
    User.remove({_id: id}, function(err, user) {
      if (err) return defer.reject(err);
      return defer.resolve(user);
    });
    return defer.promise;
  },

  createUser: function(userParams) {
    const User = mongoose.model('User');
    const roles = ['authenticated'];

    if(userParams.admin === '1') {
      delete userParams.admin;
      roles.push('admin');
    }

    const user = new User(userParams);
    user.provider = 'local';

    // TODO: User permission
    // TODO: if no user in the database, register it as admin
    user.roles = roles;

    const defer = Q.defer();
    user.save(function(err) {
      const errors = hasErrors(err);
      if(errors) return defer.reject(errors);
      defer.resolve(user);
    });

    return defer.promise;
  }
}

// Instance Methods
UserSchema.methods = {

  /**
   * HasRole - check if the user has required role
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  hasRole: function(role) {
    let roles = this.roles;
    return roles.indexOf(role) !== -1;
  },

  /**
   * IsAdmin - check if the user is an administrator
   *
   * @return {Boolean}
   * @api public
   */
  isAdmin: function() {
    return this.roles.indexOf('admin') !== -1;
  },

  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function(plainText) {
    return this.hashPassword(plainText) === this.hashed_password;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function() {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Hash password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  hashPassword: function(password) {
    if (!password || !this.salt) return '';
    const salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  },

  /**
   * Hide security sensitive fields
   *
   * @returns {*|Array|Binary|Object}
   */
  toJSON: function() {
    let obj = this.toObject();
    delete obj.hashed_password;
    delete obj.salt;
    return obj;
  }
};

mongoose.model('User', UserSchema);
