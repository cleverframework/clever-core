var gulp = require('gulp');
var config = require('../config');

gulp.task('copy', function () {
  gulp.src(config.vendor.dir.src + '/**')
    .pipe(gulp.dest(config.vendor.dir.dist));

  gulp.src(config.site.dir.img + '/**')
    .pipe(gulp.dest(config.site.dir.dist + '/img'));

  gulp.src(config.admin.dir.img + '/**')
    .pipe(gulp.dest(config.admin.dir.dist + '/img'));
});
