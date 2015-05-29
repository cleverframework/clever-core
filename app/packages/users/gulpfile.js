var gulp = require('gulp');
var requireDir = require('require-dir');
var runSequence = require('gulp-run-sequence');

// require individual tasks
requireDir('./gulp/tasks', { recurse: true });

// site
gulp.task('site-dev', ['site-styl', 'site-js-dev']);
gulp.task('site-prd', ['site-styl', 'site-js-prd']);

// admin
gulp.task('admin-dev', ['admin-styl', 'admin-js-dev']);
gulp.task('admin-prd', ['admin-styl', 'admin-js-prd']);

// default
gulp.task('default', function(cb) {
  runSequence('clean', ['copy', 'site-dev', 'admin-dev'], cb);
});

// development task
gulp.task('dev', function(cb) {
  runSequence('clean', ['copy', 'site-dev', 'admin-dev'], 'watch', cb);
});

// prd task
gulp.task('prd', function(cb) {
  runSequence('clean', ['copy', 'site-prd', 'admin-prd'], cb);
})
