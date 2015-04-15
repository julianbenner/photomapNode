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
	uglify = require('gulp-uglify'),
	source = require('vinyl-source-stream'),
	buffer = require('vinyl-buffer'),
  notify = require('gulp-notify'),
  es = require('event-stream'),
  concat = require('gulp-concat');

var config = {
	output: './public',
	sassDir: './resources/sass',
	bowerDir: './bower_components',
	nodeDir: './node_modules',

	scriptsDir: './resources/javascript',
	buildDir: './public/javascripts',
	mainScript: 'main.js'
};

gulp.task('react', function() {
  return browserify({entries: [config.scriptsDir + '/' + config.mainScript], debug: true})
    .transform(reactify)
    .bundle()
    .pipe(source(config.mainScript))
    .pipe(gulp.dest(config.buildDir))
    .pipe(notify("Bundling done"));
});

gulp.task('css', function() {
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

gulp.task('fonts', function() {
	gulp.src(config.nodeDir + '/bootstrap-sass/assets/fonts/bootstrap/*.{ttf,woff,eof,svg}')
		.pipe(gulp.dest(config.output + '/fonts'));
});

// Rerun the task when a file changes
gulp.task('watch', function() {
  gulp.watch(config.scriptsDir + '/' + "**/*.js", ['react']);
	gulp.watch(config.sassDir + '/**/*.scss', ['css']);
});

gulp.task('default', ['css', 'fonts']);