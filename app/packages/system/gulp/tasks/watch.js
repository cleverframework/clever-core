var gulp = require('gulp');
var config = require('../config');

gulp.task('watch', function () {
  gulp.watch(config.site.dir.styl + '/**/*.styl', ['site-styl']);
  gulp.watch(config.admin.dir.styl + '/**/*.styl', ['admin-styl']);
  gulp.watch(config.site.dir.js + '/**/*.js', ['site-js-dev']);
  gulp.watch(config.admin.dir.js + '/**/*.js', ['admin-js-dev']);
});
