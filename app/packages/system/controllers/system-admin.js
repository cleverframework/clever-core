'use strict';

// Module dependencies.
const config = require('clever-core').loadConfig();
const mongoose = require('mongoose');
const Setting = mongoose.model('Setting');
const async = require('async');
const util = require('../util');

// DASHBOARD

exports.showDashboard = function(SystemPackage, req, res) {
  // Always use Package.render()
  res.send(SystemPackage.render('admin/dashboard', {
    packages: SystemPackage.getCleverCore().getInstance().exportable_packages_list,
    user: req.user
  }));
};


// SETTINGS

exports.showSettings = function(SettingPackage, req, res, next) {
  let page = Number.parseInt(req.query.page);
  page = Number.isNaN(page) ? 0 : page;
  const skip = page * 10;

  function renderSettingList(settings, nSettings) {
    res.send(SettingPackage.render('admin/settings/list', {
      packages: SettingPackage.getCleverCore().getInstance().exportable_packages_list,
      user: req.user,
      settings: settings,
      nSettings: nSettings,
      activePage: page,
      csrfToken: req.csrfToken()
    }));
  }

  async.parallel([
    function getSettings(cb){
      Setting.getSettings(skip, 10)
        .then(function(settings) {
          cb(null, settings);
        })
        .catch(util.passNext.bind(null, cb));
    },
    function countSettings(cb){
      Setting.countSettings()
        .then(function(nSettings) {
          cb(null, nSettings);
        })
        .catch(util.passNext.bind(null, cb));
    }
  ], function(err, options){
      if(err) return util.passNext.bind(null, next);
      renderSettingList.apply(null, options);
  });

};

exports.showSetting = function(SettingPackage, req, res, next) {
  function render(settingToShow) {
    res.send(SettingPackage.render('admin/settings/details', {
      packages: SettingPackage.getCleverCore().getInstance().exportable_packages_list,
      user: req.user,
      settingToShow: settingToShow,
      csrfToken: req.csrfToken()
    }));
  }

  Setting.getSettingById(req.params.id)
    .then(render)
    .catch(util.passNext.bind(null, next));
};

exports.createSetting = function(SettingPackage, req, res, next) {
  res.send(SettingPackage.render('admin/settings/create', {
    packages: SettingPackage.getCleverCore().getInstance().exportable_packages_list,
    user: req.user,
    csrfToken: req.csrfToken()
  }));
};

exports.editSetting = function(SettingPackage, req, res, next) {
  function render(settingToEdit) {
    res.send(SettingPackage.render(`admin/settings/edit`, {
      packages: SettingPackage.getCleverCore().getInstance().exportable_packages_list,
      user: req.user,
      settingToEdit: settingToEdit,
      csrfToken: req.csrfToken()
    }));
  }

  Setting.getSettingById(req.params.id)
    .then(render)
    .catch(util.passNext.bind(null, next));
};


// HELP

exports.showHelp = function(SystemPackage, req, res) {
  res.send(SystemPackage.render('admin/help', {
    packages: SystemPackage.getCleverCore().getInstance().exportable_packages_list,
    user: req.user
  }));
};
