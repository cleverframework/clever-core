'use strict';

// Index
exports.index = function(ExamplePackage, req, res) {
  // Always use ExamplePackage.render()
  res.send(ExamplePackage.render('index'));
};
