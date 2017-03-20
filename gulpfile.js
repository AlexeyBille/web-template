	var gulp           = require('gulp'),
		gutil          = require('gulp-util' ),
		sass           = require('gulp-sass'),
		browserSync    = require('browser-sync'),
		concat         = require('gulp-concat'),
		cleanCSS       = require('gulp-clean-css'),
		rename         = require('gulp-rename'),
		del            = require('del'),
		imagemin       = require('gulp-imagemin'),
		pngquant       = require('imagemin-pngquant'),
		cache          = require('gulp-cache'),
		autoprefixer   = require('gulp-autoprefixer'),
		fileinclude    = require('gulp-file-include'),
		bourbon        = require('node-bourbon'),
		ftp            = require('vinyl-ftp'),
		htmlmin 	   = require('gulp-htmlmin');


gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'src'
		},
		notify: false
	});
});

gulp.task('sass', function() {
	return gulp.src('src/scss/**/*.scss')
		.pipe(autoprefixer(['last 15 versions']))
		.pipe(cleanCSS())
		.pipe(gulp.dest('src/css'))
		.pipe(browserSync.reload({stream: true}))
});
gulp.task('watch', ['sass',  'browser-sync'], function() {
	gulp.watch('src/scss/**/*.scss', ['sass']);
	gulp.watch('src/*.html', browserSync.reload);
	gulp.watch('src/js/**/*.js', browserSync.reload);
});

gulp.task('imagemin', function() {
	return gulp.src('src/img/**/*')
		.pipe(cache(imagemin({
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		})))
		.pipe(gulp.dest('dist/img'));
});

gulp.task('buildhtml', function() {
  gulp.src(['src/*.html'])
    .pipe(gulp.dest('dist/'));
});

gulp.task('removedist', function() { return del.sync('dist'); });

gulp.task('build', ['removedist', 'buildhtml', 'imagemin', 'sass' ], function() {

	var buildCss = gulp.src([
		'src/css/header.css',
		'src/css/main.css',
		'src/css/footer.css'
		]).pipe(gulp.dest('dist/css'));

	var buildFiles = gulp.src([
		'src/.htaccess'
	]).pipe(gulp.dest('dist'));

	var buildFonts = gulp.src('src/fonts/**/*').pipe(gulp.dest('dist/fonts'));

	var buildJs = gulp.src('src/js/**/*').pipe(gulp.dest('dist/js'));

});


gulp.task('clearcache', function () { return cache.clearAll(); });

gulp.task('default', ['watch']);
