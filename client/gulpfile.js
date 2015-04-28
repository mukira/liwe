/* jshint strict: false */

/**
 * File structure         Gulp task
 * -------------------    ---------
 * 
 * fonts/                 assets
 * svg/                   x
 * script/
 *     vendor/            [by bower]
 *     app.remote.js      remote-script
 *     app.home.js        home-script
 * api/
 *     liwe.js            window-script
 * style/
 *     home.css           home-style
 *     remote.css         remote-style
 * remote.html            remote-html
 * window.html            window-html
 * index.html             home-html
 */

var gulp      = require('gulp'),
  fileInsert  = require('gulp-file-insert'),
  replace     = require('gulp-replace'),
  gutil       = require('gulp-util'),
  uglify      = require('gulp-uglify'),
  concat      = require('gulp-concat'),
  jshint      = require('gulp-jshint'),
  sass        = require('gulp-sass'),
  config      = require('./../config'),
  t           = {},
  r           = {
    public: './public'
  };

t.homeHtml     = {src: './source/home/index.html', dstFn: 'index.html', dstRp: r.public};
t.remoteHtml   = {src: './source/remote/index.html', dstFn: 'remote.html', dstRp: r.public};
t.windowHtml   = {src: './source/window/iframe/index.html', dstFn: 'window.html', dstRp: r.public};

t.homeScript   = {src: './source/home/script/**/*.js', dstFn: 'app.home.js', dstRp: r.public + '/script/'};
t.remoteScript = {src: './source/remote/script/**/*.js', dstFn: 'app.remote.js', dstRp: r.public + '/script/'};
t.windowScript = {src: './source/window/webappkit/Liwe.js', dstFn: 'liwe.js', dstRp: r.public + '/api/'};

t.homeStyle    = {src: './source/home/style/**/*.scss', dstFn: 'home.css', dstRp: r.public + '/style/'};
t.remoteStyle  = {src: './source/remote/style/**/*.scss', dstFn: 'remote.css', dstRp: r.public + '/style/'};

t.assets       = {src: './source/assets/**/*', dstRp: r.public + '/assets/'};


/**
 * Functions
 ************************************************
 */

var getValue = function (obj, str) {
  return str.split('.').reduce(function(o, x) { return o[x]; }, obj);
};

var configReplace = function () {
  return replace(/\/\*\* @([a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*) \*\*\//g, function ($0, $1) {
    if (!$1) {
      return '';
    }
    else {
      return getValue(config, $1) || '';
    }
  });
};


/**
 * Script
 ************************************************
 */

/**
 * home-script
 * run JShint on the script
 */
gulp.task('home-script', function() {
  return gulp.src(t.homeScript.src)
    .pipe(configReplace())
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(concat(t.homeScript.dstFn))
    .pipe(uglify())
    .pipe(gulp.dest(t.homeScript.dstRp));
});

/**
 * remote-script
 * run JShint on the script
 */
gulp.task('remote-script', function() {
  return gulp.src(t.remoteScript.src)
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(concat(t.remoteScript.dstFn))
    // .pipe(uglify())
    .pipe(gulp.dest(t.remoteScript.dstRp));
});

/**
 * window-script
 * Create api script
 */
gulp.task('window-script', function () {
  return gulp.src(t.windowScript.src)
    .pipe(fileInsert({
      '/* Event.js */' : 'source/window/webappkit/Event.js',
      '/* Remote.js */': 'source/window/webappkit/Remote.js'
    }))
    .pipe(configReplace())
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(concat(t.windowScript.dstFn))
    // .pipe(uglify())
    .pipe(gulp.dest(t.windowScript.dstRp));
});


/**
 * Styles
 ************************************************
 */

/**
 * remote-style
 * Run compass on remote style and export it
 * into the public folder
 */
gulp.task('remote-style', function() {
  return gulp.src(t.remoteStyle.src)
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(concat(t.remoteStyle.dstFn))
    .pipe(gulp.dest(t.remoteStyle.dstRp));
});

/**
 * home-style
 * Run compass on home style and export it
 * into the public folder
 */
gulp.task('home-style', function() {
  return gulp.src(t.homeStyle.src)
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(concat(t.homeStyle.dstFn))
    .pipe(gulp.dest(t.homeStyle.dstRp));
});


/**
 * HTML
 ************************************************
 */

/**
 * home-html
 * Generate the final homepage html code for the
 * public folder
 */
gulp.task('home-html', function() {
  return gulp.src(t.homeHtml.src)
    .pipe(gulp.dest(t.homeHtml.dstRp));
});

/**
 * remote-html
 * Generate the final remote html code for the
 * public folder
 */
gulp.task('remote-html', function() {
  return gulp.src(t.remoteHtml.src)
    .pipe(concat(t.remoteHtml.dstFn))
    .pipe(gulp.dest(t.remoteHtml.dstRp));
});

/**
 * window-html
 * Generate the final iframe html code for the
 * public folder
 */
gulp.task('window-html', function() {
  return gulp.src(t.windowHtml.src)
    .pipe(fileInsert({
      '/* main.js */': 'source/window/iframe/main.js'
    }))
    .pipe(concat(t.windowHtml.dstFn))
    //.pipe(uglify())
    .pipe(gulp.dest(t.windowHtml.dstRp));
});


/**
 * Micellaneous
 ************************************************
 */

/**
 * assets
 * copy assets to public/
 */
gulp.task('assets', function() {
  return gulp.src(t.assets.src)
    .pipe(gulp.dest(t.assets.dstRp));
});


/**
 * Public
 ************************************************
 */

/**
 * develop
 * Task to develop, it run a watch which pass JShint and build
 * the final script.
 *
 */
gulp.task('develop', function() {
  // Script
  gulp.watch(t.homeScript.src, ['home-script']);
  gulp.watch(t.remoteScript.src, ['remote-script']);
  gulp.watch(t.windowScript.src, ['window-script']);

  // Style
  gulp.watch(t.homeStyle.src, ['home-style']);
  gulp.watch(t.remoteStyle.src, ['remote-style']);

  // HTML
  gulp.watch(t.homeHtml.src, ['home-html']);
  gulp.watch(t.remoteHtml.src, ['remote-html']);
  gulp.watch(t.windowHtml.src, ['window-html']);

  // Assets
  gulp.watch(t.assets.src, ['assets']);
});

/**
 * build
 * generate the final code of the app
 *
 */
gulp.task('build', function() {
  gulp.run(
    'home-script',
    'remote-script',
    'window-script',
    'home-style',
    'remote-style',
    'home-html',
    'remote-html',
    'window-html',
    'assets'
  );
});
