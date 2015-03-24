// globals require

(function () {
  'use strict';

  let morgan = require('morgan');

  module.exports = function(app, config) {
    let format, options;

    if (config !== false) {
      config = config || {};

      format  = config.format || 'dev';
      options = config.options || {};

      app.use(morgan(format, options));
    }
  };

})();
