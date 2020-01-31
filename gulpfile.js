const gulp = require('gulp');
const path = require('path');
const postcss = require('gulp-postcss');
const sass = require('gulp-sass');
const csso = require('gulp-csso');
const autoprefixer = require('autoprefixer');
const browserSync = require('browser-sync').create();
const gulpIf = require('gulp-if');
const sourcemaps = require('gulp-sourcemaps');
const svgSymbols = require('gulp-svg-symbols');
const svgmin = require('gulp-svgmin');
const rename = require('gulp-rename');
const del = require('del');
const gutil = require('gulp-util');
const pug = require('gulp-pug');
const tinypng = require('gulp-tinypng-nokey');
const webpackStream = require('webpack-stream');
const webpack = require('webpack');

const isDevelopment = process.env.NODE_ENV !== 'production';

sass.compiler = require('node-sass');

gulp.task('views', function buildHTML() {
  return gulp.src('./src/pages/**/*.pug')
    .pipe(pug({
      pretty: true
    }))
    .on('error', function(error) {
      gutil.log(gutil.colors.red('Error: ' + error.message));
      this.emit('end');
    })
    .pipe(gulp.dest('./public'));
});

gulp.task('styles', function () {
  return gulp.src('./src/app.scss')
    .pipe(gulpIf(isDevelopment, sourcemaps.init()))
    .pipe(sass().on('error', sass.logError))
    .pipe(gulpIf(!isDevelopment, postcss([ autoprefixer() ])))
    .pipe(gulpIf(!isDevelopment, csso()))
    .pipe(rename('style.css'))
    .pipe(gulpIf(isDevelopment, sourcemaps.write()))
    .pipe(gulp.dest('./public/css'));
});

gulp.task('scripts', function () {
  return gulp.src('./src/app.js')
    .pipe(webpackStream(require('./webpack.config'), webpack))
    .pipe(gulp.dest('./public/js'));
});

gulp.task('fonts', function () {
  return gulp.src('./src/assets/fonts/**/*.*')
    .pipe(gulp.dest('./public/fonts'));
});

gulp.task('images', function () {
  return gulp.src([ './src/assets/images/**/*.*' ])
    .pipe(gulpIf([ isDevelopment ? '!' : '*', '!*.svg' ], tinypng()))
    .pipe(gulp.dest('./public/images'));
});

gulp.task('svgSymbols', function () {
  return gulp.src('./src/assets/images/svg/**/*.svg')
    .pipe(svgmin((file) => {
      const prefix = path.basename(file.relative, path.extname(file.relative));

      return {
        plugins: [{
          removeViewBox: false,
          cleanupIDs: {
            prefix: prefix + '-',
            minify: true
          }
          }]
      };
    }))
    .pipe(svgSymbols({
      templates: ['default-svg'],
      class: '.icon_%f',
      svgAttrs: {
        style: `
          position: absolute;
          width: 0;
          height: 0;
        `
      }
    }))
    .pipe(gulp.dest('./public'));
});

gulp.task('misc', function () {
  return gulp.src('./src/assets/misc/**/*.*')
    .pipe(gulp.dest('./public'));
});

gulp.task('db', function () {
  return gulp.src('./src/db/**/*.json')
    .pipe(gulp.dest('./public/db'));
});

gulp.task('watch', function () {
  gulp.watch('./src/db/*.json', gulp.series('db'));
  gulp.watch('./src/**/*.pug', gulp.series('views'));
  gulp.watch('./src/**/*.{js,vue,pug,scss}', gulp.series('scripts'));
  gulp.watch('./src/**/*.{css,scss}', gulp.series('styles'));
  gulp.watch('./src/assets/images/**/*.*', gulp.series('images'));
  gulp.watch('./src/assets/images/svg/**/*.svg', gulp.series('svgSymbols', 'views'));
});

gulp.task('serve', function () {
  browserSync.init({
    server: './public',
    port: 8080
  });

  browserSync.watch('./public/**/*.*').on('change', browserSync.reload);
});

gulp.task('clean', function () {
  return del('./public')
});

gulp.task('build', gulp.series(
  'clean',
  'svgSymbols',
  gulp.parallel(
    'views',
    'styles',
    'scripts',
    'fonts',
    'images'
  )));

gulp.task('default', gulp.series(
  'build',
  gulp.parallel(
    'watch',
    'serve'
  ))
);
