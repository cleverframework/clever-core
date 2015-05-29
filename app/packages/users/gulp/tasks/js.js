var config = require('../config');
var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

// dev: source maps, debug
gulp.task('site-js-dev', function () {
  return browserify(config.site.index.js, { debug: true })
    .transform(babelify.configure())
    .bundle()
    .pipe(source('index.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(gulp.dest(config.site.dir.dist));
});

gulp.task('admin-js-dev', function () {
  return browserify(config.admin.index.js, { debug: true })
    .transform(babelify.configure())
    .bundle()
    .pipe(source('index.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(gulp.dest(config.admin.dir.dist));
});


// prd: uglified
gulp.task('site-js-prd', function () {
  return browserify(config.site.index.js)
    .transform(babelify)
    .bundle()
    .pipe(source('index.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest(config.site.dir.dist));
});

gulp.task('admin-js-prd', function () {
  return browserify(config.admin.index.js)
    .transform(babelify)
    .bundle()
    .pipe(source('index.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest(config.admin.dir.dist));
});
