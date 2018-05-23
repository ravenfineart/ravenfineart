var gulp        = require('gulp');
var gulpIf      = require('gulp-if');
var useref      = require('gulp-useref');
var browserSync = require('browser-sync').create();
var sass        = require('gulp-sass');
var uglify      = require('gulp-uglify');
var cssnano     = require('gulp-cssnano');
var fileinclude = require('gulp-file-include');
var inject      = require('gulp-inject');

var config = {
    buildDir: './build',
    distDir: './dist',
};

gulp.task('fileinclude', function() {
  gulp.src(['./build/*.html'])
    .pipe(fileinclude())
    .pipe(gulp.dest('./dist'));
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
    return gulp.src(['node_modules/bootstrap/scss/bootstrap.scss', 'src/scss/*.scss'])
        .pipe(sass())
        .pipe(gulp.dest("dist/css"))
        .pipe(browserSync.stream());
});

// Move the javascript files into our /src/js folder
gulp.task('js', function() {
    return gulp.src(['node_modules/bootstrap/dist/js/bootstrap.min.js', 'node_modules/jquery/dist/jquery.min.js', 'node_modules/tether/dist/js/tether.min.js'])
        .pipe(gulp.dest("dist/js"))
        .pipe(browserSync.stream());
});

gulp.task('useref', function() {
  return gulp.src('./*.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulpIf('*.css', cssnano()))
		.pipe(gulp.dest(config.distDir));
});

gulp.task('index', ['useref'], function () {
  var target = gulp.src('./build/*.html');
  var sources = gulp.src(['./dist/js/**/*.js', './dist/css/**/*.css'], {read: false});
 	return target.pipe(inject(sources, {ignorePath: 'dist/', addRootSlash: false}))
 	.pipe(gulpIf('*.html', fileinclude({prefix: '@@', basepath: '@file'})))
	.pipe(gulp.dest(config.distDir));
});

gulp.task('images', function(){
  return gulp.src('build/images/**/*.+(png|jpg|gif|svg)')
  .pipe(imagemin())
  .pipe(gulp.dest('dist/images'))
});

// Static Server + watching scss/html files
gulp.task('serve', ['sass', 'fileinclude', 'index'], function() {

    browserSync.init({
        server: "./dist"
    });

gulp.task('html-watch', ['index'], function() { browserSync.reload(); });

    gulp.watch('./**/*.html', ['html-watch']);
    gulp.watch(['node_modules/bootstrap/scss/bootstrap.scss', 'dist/scss/*.scss'], ['sass']);
    gulp.watch("dist/*.html").on('change', browserSync.reload);
});

gulp.task('default', ['js','serve']);
