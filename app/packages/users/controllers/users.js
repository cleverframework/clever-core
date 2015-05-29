'use strict';

// Module dependencies.
const mongoose = require('mongoose');
const User = mongoose.model('User');
const async = require('async');
const config = require('clever-core').loadConfig();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const templates = require('../template');
const util = require('../util');

// Find user by id
exports.user = function(req, res, next, id) {
  User.findOne({
    _id: id
  }).exec(function(err, user) {
    if (err) return next(err);
    if (!user) return next(new Error(`Failed to load User ${id}`));
    req.profile = user;
    next();
  });
};

// Auth callback
exports.authCallback = function(req, res) {
  res.redirect('/');
};

// Show login form
exports.signin = function(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.redirect('/login');
};

// Show user register form
exports.register = function(UserPackage, req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.send(UserPackage.render('site/register', {
    csrfToken: req.csrfToken()
  }));
};

// Create user
exports.createUser = function(UserPackage, req, res, next) {

  // because we set our user.provider to local our models/user.js validation will always be true
  req.assert('firstName', 'You must enter your first name').notEmpty();
  req.assert('lastName', 'You must enter your last name').notEmpty();
  req.assert('firstName', 'Firstname cannot be more than 32 characters').len(1, 32);
  req.assert('lastName', 'Lastname cannot be more than 32 characters').len(1, 32);
  req.assert('email', 'You must enter a valid email address').isEmail();
  req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
  // req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).json(errors);
  }

  function automaticLogin(user) {
    req.logIn(user, function(err) {
      if (err) return next(err);
      return res.status(200).json(user);
    });
  }

  User.createUser(req.body)
    .then(automaticLogin)
    .catch(util.sendObjectAsHttpResponse.bind(null, res, 400));
};

// Show user login form
exports.login = function(UserPackage, req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.send(UserPackage.render('site/login', {
    csrfToken: req.csrfToken(),
    message: req.flash('error'),
  }));
};

// Logout
exports.signout = function(req, res) {
  req.logout();
  res.redirect('/');
};

// Session
exports.session = function(req, res) {
  res.redirect('/');
};

// Resets the password
exports.resetPassword = function(req, res, next) {
  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  }, function(err, user) {
    if (err) {
      return res.status(400).json({
        msg: err
      });
    }
    if (!user) {
      return res.status(400).json({
        msg: 'Token invalid or expired'
      });
    }
    req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
    var errors = req.validationErrors();
    if (errors) {
      return res.status(400).send(errors);
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.save(function(err) {
      req.logIn(user, function(err) {
        if (err) return next(err);
        return res.send({
          user: user
        });
      });
    });
  });
};

// Send reset password email
function sendMail(mailOptions) {
  var transport = nodemailer.createTransport(config.mailer);
  transport.sendMail(mailOptions, function(err, response) {
    if (err) return err;
    return response;
  });
}

// Callback for forgot password link
exports.forgotPassword = function(req, res, next) {
  async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({
          $or: [{
            email: req.body.text
          }, {
            username: req.body.text
          }]
        }, function(err, user) {
          if (err || !user) return done(true);
          done(err, user, token);
        });
      },
      function(user, token, done) {
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        user.save(function(err) {
          done(err, token, user);
        });
      },
      function(token, user, done) {
        var mailOptions = {
          to: user.email,
          from: config.emailFrom
        };
        mailOptions = templates.forgot_password_email(user, req, token, mailOptions);
        sendMail(mailOptions);
        done(null, true);
      }
    ],
    function(err, status) {
      var response = {
        message: 'Mail successfully sent',
        status: 'success'
      };
      if (err) {
        response.message = 'User does not exist';
        response.status = 'danger';
      }
      res.json(response);
    }
  );
};
