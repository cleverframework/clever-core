var path = require('path');
var config = {};

// generic
config.site = {};
config.admin = {};
config.vendor = {};
config.dir = {
  assets: path.join(__dirname, '../assets'),
  src: path.join(__dirname, '../assets/src'),
  dist: path.join(__dirname, '../assets/dist')
}

// site directories
config.vendor.dir = {
  src: path.join(__dirname, '../assets/src/vendor'),
  dist: path.join(__dirname, '../assets/dist/vendor') // not used
};

// site directories
config.site.dir = {
  src: path.join(__dirname, '../assets/src/site'),
  dist: path.join(__dirname, '../assets/dist/site'),
  styl: path.join(__dirname, '../assets/src/site/styl'),
  js: path.join(__dirname, '../assets/src/site/js'),
  img: path.join(__dirname, '../assets/src/site/img')
};

// site index files
config.site.index = {
  js: config.site.dir.js + '/index.js',
  styl: config.site.dir.styl + '/index.styl'
};

// admin directories
config.admin.dir = {
  src: path.join(__dirname, '../assets/src/admin'),
  dist: path.join(__dirname, '../assets/dist/admin'),
  styl: path.join(__dirname, '../assets/src/admin/styl'),
  js: path.join(__dirname, '../assets/src/admin/js'),
  img: path.join(__dirname, '../assets/src/admin/img')
};

// admin index files
config.admin.index = {
  js: config.admin.dir.js + '/index.js',
  styl: config.admin.dir.styl + '/index.styl'
};


module.exports = config;
