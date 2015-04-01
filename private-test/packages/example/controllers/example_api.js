'use strict';

// Index
exports.index = function(ExamplePackage, req, res) {
  // Always use ExamplePackage.render()
  res.json({
    'example': 'works'
  });
};
