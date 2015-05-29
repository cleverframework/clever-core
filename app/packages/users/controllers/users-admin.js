'use strict';

// Module dependencies.
const config = require('clever-core').loadConfig();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const async = require('async');
const util = require('../util');

// Show user list
exports.showUsers = function(UserPackage, req, res, next) {
  let page = Number.parseInt(req.query.page);
  page = Number.isNaN(page) ? 0 : page;
  const skip = page * 10;

  function renderUserList(users, nUsers) {
    res.send(UserPackage.render('admin/list', {
      packages: UserPackage.getCleverCore().getInstance().exportable_packages_list,
      user: req.user,
      users: users,
      nUsers: nUsers,
      activePage: page,
      csrfToken: req.csrfToken()
    }));
  }

  async.parallel([
    function getUsers(cb){
      User.getUsers(skip, 10)
        .then(function(users) {
          cb(null, users);
        })
        .catch(util.passNext.bind(null, cb));
    },
    function countUsers(cb){
      User.countUsers()
        .then(function(nUsers) {
          cb(null, nUsers);
        })
        .catch(util.passNext.bind(null, cb));
    }
  ], function(err, options){
      if(err) return util.passNext.bind(null, next);
      renderUserList.apply(null, options);
  });

};

exports.showUser = function(UserPackage, req, res, next) {
  function render(userToShow) {
    res.send(UserPackage.render('admin/details', {
      packages: UserPackage.getCleverCore().getInstance().exportable_packages_list,
      user: req.user,
      userToShow: userToShow,
      csrfToken: req.csrfToken()
    }));
  }

  User.getUserById(req.params.id)
    .then(render)
    .catch(util.passNext.bind(null, next));
};

exports.createUser = function(UserPackage, req, res, next) {
  res.send(UserPackage.render('admin/create', {
    packages: UserPackage.getCleverCore().getInstance().exportable_packages_list,
    user: req.user,
    csrfToken: req.csrfToken()
  }));
};

exports.editUser = function(UserPackage, req, res, next) {
  function render(userToEdit) {
    const viewPath = req.params.opt === 'change-password' ? `admin/${req.params.opt}` : `admin/edit`
    res.send(UserPackage.render(viewPath, {
      packages: UserPackage.getCleverCore().getInstance().exportable_packages_list,
      user: req.user,
      userToEdit: userToEdit,
      csrfToken: req.csrfToken()
    }));
  }

  User.getUserById(req.params.id)
    .then(render)
    .catch(util.passNext.bind(null, next));
};
