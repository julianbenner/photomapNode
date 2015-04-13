// Basic Gulp File
//
var gulp = require('gulp'),
	sass = require('gulp-ruby-sass'),
	autoprefix = require('gulp-autoprefixer'),
	notify = require("gulp-notify");

var config = {
	sassPath: './resources/sass',
	bowerDir: './bower_components',
	nodeDir: './node_modules'
};

gulp.task('css', function() {
	return sass(config.sassPath + '/style.scss', {
			style: 'compressed',
			loadPath: [
				'./resources/sass',
				config.bowerDir + '/bootstrap-sass-official/assets/stylesheets',
				config.nodeDir + '/font-awesome/scss',
			]
		})
		.on("error", notify.onError(function(error) {
			return "Error: " + error.message;
		}))
		.pipe(autoprefix('last 2 version'))
		.pipe(gulp.dest('./public/css'));
});

// Rerun the task when a file changes
gulp.task('watch', function() {
	gulp.watch(config.sassPath + '/**/*.scss', ['css']);
});

gulp.task('default', ['css']);