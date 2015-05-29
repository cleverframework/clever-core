'use strict';

// Dependencies
let router = require('express').Router();

// Require CleverCore
let CleverCore = require('clever-core');

// Load config
let config = CleverCore.loadConfig();

// Load controller
let usersCtrl = require('../controllers/users');

// Exports
module.exports = function(UserPackage, app, auth, database, passport) {

  // Show registration form
  router.get('/register', usersCtrl.register.bind(null, UserPackage));

  // Create user
  router.post('/register', usersCtrl.createUser.bind(null, UserPackage));

  // Logout user
  router.get('/logout', usersCtrl.signout);

  // Send email for reset password
  router.post('/forgot-password/:token', usersCtrl.forgotPassword);

  // Reset password
  router.post('/reset:token', usersCtrl.resetPassword);

  // Show login form
  router.get('/login', usersCtrl.login.bind(null, UserPackage));

  // Login with local strategy
  router.post('/login', passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/login',
		failureFlash : true
	}));

  // Setting the facebook oauth routes
  router.get('/auth/facebook', passport.authenticate('facebook', {
      scope: ['email', 'user_about_me'],
      failureRedirect: '/login'
    }), usersCtrl.signin);

  router.get('/auth/facebook/callback', passport.authenticate('facebook', {
      failureRedirect: '/login'
    }), usersCtrl.authCallback);

  // Setting the github oauth routes
  router.get('/auth/github', passport.authenticate('github', {
      failureRedirect: '/login'
    }), usersCtrl.signin);

  router.get('/auth/github/callback', passport.authenticate('github', {
      failureRedirect: '/login'
    }), usersCtrl.authCallback);

  // Setting the twitter oauth routes
  router.get('/auth/twitter', passport.authenticate('twitter', {
      failureRedirect: '/login'
    }), usersCtrl.signin);

  router.get('/auth/twitter/callback', passport.authenticate('twitter', {
      failureRedirect: '/login'
    }), usersCtrl.authCallback);

  // Setting the google oauth routes
  router.get('/auth/google', passport.authenticate('google', {
      failureRedirect: '/login',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ]
    }), usersCtrl.signin);

  router.get('/auth/google/callback', passport.authenticate('google', {
      failureRedirect: '/login'
    }), usersCtrl.authCallback);

  // Setting the linkedin oauth routes
  router.get('/auth/linkedin', passport.authenticate('linkedin', {
      failureRedirect: '/login',
      usersCtrl: ['r_emailaddress']
    }), usersCtrl.signin);

  router.get('/auth/linkedin/callback', passport.authenticate('linkedin', {
      failureRedirect: '/login'
    }), usersCtrl.authCallback);


  return new CleverCore.CleverRoute(router, 'site', true);

};
