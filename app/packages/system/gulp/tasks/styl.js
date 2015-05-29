var gulp = require('gulp');
var stylus = require('gulp-stylus');
var autoprefixer = require('gulp-autoprefixer');
var csso = require('gulp-csso');
var config = require('../config');
var mixins = require('stylus-mixins');
var rupture = require('rupture');

gulp.task('site-styl', function () {
  return gulp.src(config.site.index.styl)
    .pipe(stylus({
      use: [rupture(), mixins()]
    }))
    .pipe(autoprefixer())
    .pipe(csso())
    .pipe(gulp.dest(config.site.dir.dist));
});

gulp.task('admin-styl', function () {
  return gulp.src(config.admin.index.styl)
    .pipe(stylus({
      use: [rupture(), mixins()]
    }))
    .pipe(autoprefixer())
    .pipe(csso())
    .pipe(gulp.dest(config.admin.dir.dist));
});
