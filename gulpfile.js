// Basic Gulp File
//
var gulp = require('gulp'),
  sass = require('gulp-ruby-sass'),
  gutil = require('gulp-util'),
  autoprefix = require('gulp-autoprefixer'),
  notify = require("gulp-notify"),
  browserify = require('browserify'),
  reactify = require('reactify'),
  watchify = require('watchify'),
  source = require('vinyl-source-stream'),
  es = require('event-stream'),
  concat = require('gulp-concat'),
  es6ify = require('es6ify'),
  babelify = require("babelify");

var config = {
  output: './public',
  sassDir: './resources/sass',
  bowerDir: './bower_components',
  nodeDir: './node_modules',

  scriptsDir: './resources/javascript',
  buildDir: './public/javascripts',
  mainScript: 'main.js'
};

var requireFiles = config.nodeDir + '/react/react.js';

function handleErrors() {
  var args = Array.prototype.slice.call(arguments);
  notify.onError({
    title: "Compile Error",
    message: "<%= error.message %>"
  }).apply(this, args);
  this.emit('end'); // Keep gulp from hanging on this task
}

function compileScripts(watch) {
  gutil.log('Starting browserify');

  var entryFile = config.scriptsDir + '/' + config.mainScript;
  es6ify.traceurOverrides = {experimental: true};

  var bundler = browserify({ debug: true })
    .transform(babelify)
    .require(entryFile, { entry: true });
  if (watch) {
    bundler = watchify(bundler);
  }

  var rebundle = function () {
    bundler.bundle()
      .on("error", function (err) { console.log("Error: " + err.message); })
      .pipe(source(config.mainScript))
      .pipe(gulp.dest(config.buildDir))
      .pipe(notify("Bundling done"));
  };

  bundler.on('update', rebundle);
  return rebundle();
}

gulp.task('css', function () {
  var appCss = sass(config.sassDir + '/style.scss', {
    style: 'compressed',
    loadPath: [
      './resources/sass',
      config.nodeDir + '/bootstrap-sass/assets/stylesheets'
    ]
  }).on('error', gutil.log);
  var mapboxCss = gulp.src(config.nodeDir + '/mapbox.js/theme/style.css');

  return es.concat(appCss, mapboxCss)
    .pipe(concat('style.css'))
    .pipe(autoprefix('last 10 version'))
    .pipe(gulp.dest(config.output + '/css'))
    .pipe(notify("SASS done"));
});

gulp.task('fonts', function () {
  gulp.src(config.nodeDir + '/bootstrap-sass/assets/fonts/bootstrap/*.{ttf,woff,eof,svg}')
    .pipe(gulp.dest(config.output + '/fonts'));
});

// Rerun the task when a file changes
gulp.task('watch', function () {
  compileScripts(true);

  gulp.watch(config.sassDir + '/**/*.scss', ['css']);
});

gulp.task('default', ['css', 'fonts']);