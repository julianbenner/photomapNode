// Basic Gulp File
//
var gulp = require('gulp'),
	sass = require('gulp-ruby-sass'),
	autoprefix = require('gulp-autoprefixer'),
	notify = require("gulp-notify");

var config = {
	output: './public',
	sassPath: './resources/sass',
	bowerDir: './bower_components',
	nodeDir: './node_modules'
};

gulp.task('css', function() {
	return sass(config.sassPath + '/style.scss', {
			style: 'compressed',
			loadPath: [
				'./resources/sass',
<<<<<<< HEAD
				config.nodeDir + '/bootstrap-sass/assets/stylesheets'
=======
				config.bowerDir + '/bootstrap-sass-official/assets/stylesheets',
				config.nodeDir + '/font-awesome/scss',
>>>>>>> 0baadadeb3ee9d337e96445d396d52a2024b4500
			]
		})
		.on("error", notify.onError(function(error) {
			return "Error: " + error.message;
		}))
		.pipe(autoprefix('last 2 version'))
		.pipe(gulp.dest(config.output + '/css'));
});

gulp.task('fonts', function() {
   gulp.src(config.nodeDir + '/bootstrap-sass/assets/fonts/bootstrap/*.{ttf,woff,eof,svg}')
   .pipe(gulp.dest(config.output + '/fonts'));
});

// Rerun the task when a file changes
gulp.task('watch', function() {
	gulp.watch(config.sassPath + '/**/*.scss', ['css']);
});

gulp.task('default', ['css', 'fonts']);
