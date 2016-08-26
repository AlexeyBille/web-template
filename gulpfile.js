	var gulp           = require('gulp'),
		gutil          = require('gulp-util' ),
		sass           = require('gulp-sass'),
		browserSync    = require('browser-sync'),
		concat         = require('gulp-concat'),
		uglify         = require('gulp-uglify'),
		uglifycss	   = require('gulp-uglifycss'),
		cleanCSS       = require('gulp-clean-css'),
		rename         = require('gulp-rename'),
		del            = require('del'),
		imagemin       = require('gulp-imagemin'),
		pngquant       = require('imagemin-pngquant'),
		cache          = require('gulp-cache'),
		autoprefixer   = require('gulp-autoprefixer'),
		fileinclude    = require('gulp-file-include'),
		gulpRemoveHtml = require('gulp-remove-html'),
		bourbon        = require('node-bourbon'),
		ftp            = require('vinyl-ftp'),
		htmlmin 	   = require('gulp-htmlmin');

gulp.task('minify', function() {
  return gulp.src('src/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist'));
});
		

gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'src'
		},
		notify: false
	});
});

gulp.task('sass', ['headersass'], function() {
	return gulp.src('src/scss/**/*.scss')
		.pipe(sass({
			includePaths: bourbon.includePaths
		}).on('error', sass.logError))
		.pipe(rename({suffix: '.min', prefix : ''}))
		.pipe(autoprefixer(['last 15 versions']))
		.pipe(cleanCSS())
		.pipe(gulp.dest('src/css'))
		.pipe(browserSync.reload({stream: true}))
});

gulp.task('headersass', function() {
	return gulp.src('src/header.scss')
		.pipe(sass({
			includePaths: bourbon.includePaths
		}).on('error', sass.logError))
		.pipe(rename({suffix: '.min', prefix : ''}))
		.pipe(autoprefixer(['last 15 versions']))
		.pipe(cleanCSS())
		.pipe(gulp.dest('src'))
		.pipe(browserSync.reload({stream: true}))
});

gulp.task('libs', function() {
	return gulp.src([
		'src/libs/jquery/dist/jquery.min.js', // Берем jQuery
		'src/libs/bootstrap/dist/js/bootstrap.min.js', // Берем bootstrap
		'src/libs/jquery-sticky/jquery.sticky.js', // Берем sticky
		'src/libs/parallax.js/parallax.min.js' // Берем parallax.js
		])
		.pipe(concat('libs.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('src/js'));
});

gulp.task('csslibs', function() {
	return gulp.src([
		'src/libs/font-awesome/css/font-awesome.min.css'
		])
		.pipe(concat('libs.min.css'))
		.pipe(uglifycss())
		.pipe(gulp.dest('src/css'));
});


gulp.task('watch', ['sass', 'libs', 'browser-sync', 'csslibs'], function() {
	gulp.watch('src/header.scss', ['headersass']);
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
    .pipe(fileinclude({
      prefix: '@@'
    }))
	.pipe(htmlmin({collapseWhitespace: true}))
	.pipe(gulpRemoveHtml())
    .pipe(gulp.dest('dist/'));
});

gulp.task('removedist', function() { return del.sync('dist'); });

gulp.task('build', ['removedist', 'buildhtml', 'imagemin', 'sass', 'libs', 'csslibs'], function() {

	var buildCss = gulp.src([
		'src/css/fonts.min.css',
		'src/css/main.min.css',
		'src/css/libs.min.css'
		]).pipe(gulp.dest('dist/css'));

	var buildFiles = gulp.src([
		'src/.htaccess'
	]).pipe(gulp.dest('dist'));

	var buildFonts = gulp.src('src/fonts/**/*').pipe(gulp.dest('dist/fonts'));

	var buildJs = gulp.src('src/js/**/*').pipe(gulp.dest('dist/js'));

});

gulp.task('deploy', function() {

	var conn = ftp.create({
		host:      'hostname.com',
		user:      'username',
		password:  'userpassword',
		parallel:  10,
		log: gutil.log
	});

	var globs = [
	'dist/**',
	'dist/.htaccess',
	];
	return gulp.src(globs, {buffer: false})
	.pipe(conn.dest('/path/to/folder/on/server'));

});

gulp.task('clearcache', function () { return cache.clearAll(); });

gulp.task('default', ['watch']);
