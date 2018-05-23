var gulp          = require('gulp');
var gulpIf        = require('gulp-if');
var useref        = require('gulp-useref');
var gulpSequence  = require('gulp-sequence');
var browserSync   = require('browser-sync').create();
var sass          = require('gulp-sass');
var concat        = require('gulp-concat');
var rename        = require('gulp-rename');
var uglify        = require('gulp-uglify');
var cssnano       = require('gulp-cssnano');
var fileinclude   = require('gulp-file-include');
var inject        = require('gulp-inject');
var imagemin      = require('gulp-imagemin');
var sourcemaps    = require('gulp-sourcemaps');

var config = {
    buildDir: './build',
    distDir: './dist',
};

gulp.task('minify', function(){
  return gulp.src('./build/js/*.js')
    .pipe(concat('all.js'))
    .pipe(gulp.dest(config.distDir + '/js'))
    .pipe(rename('all.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(config.distDir + '/js'));
});

gulp.task('minify-css', function() {
    return gulp.src('./dist/css/styles.css')
        .pipe(cssnano())
        .pipe(gulp.dest('./dist/css-min/'));
});

gulp.task('fileinclude', function() {
  gulp.src(['./build/*.html'])
    .pipe(fileinclude())
    .pipe(gulp.dest('./dist'));
});

gulp.task('sass', function() {
    return gulp.src(config.buildDir + '/scss/**/*.scss')
    .pipe(sourcemaps.init())  // Process the original sources
    .pipe(sass())
    .pipe(sourcemaps.write()) // Add the map to modified source.
    .pipe(gulp.dest(config.distDir + '/css'));
});

gulp.task('sass-ravenfineart', function() {
    return gulp.src(config.buildDir + '/scss-ravenfineart/**/*.scss')
    .pipe(sourcemaps.init())  // Process the original sources
    .pipe(sass())
    .pipe(sourcemaps.write()) // Add the map to modified source.
    .pipe(gulp.dest(config.distDir + '/css-ravenfineart'));
});

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

gulp.task('sass-watch', ['sass'], function() {
    browserSync.reload();
});
gulp.task('sass-ravenfineart-watch', ['sass-ravenfineart'], function() {
    browserSync.reload();
});
gulp.task('html-watch', ['index'], function() {
    browserSync.reload();
});
gulp.task('js-watch', ['minify'], function() {
    browserSync.reload();
});

gulp.task('serve', ['sass', 'sass-ravenfineart', 'index', 'minify'], function () {
  browserSync.init({
    server: {
      baseDir: "./dist"
    }
});
gulp.watch('./build/**/*.html', ['html-watch']);
gulp.watch(config.buildDir + '/scss/**/*.scss', ['sass-watch']);
gulp.watch(config.buildDir + '/scss-ravenfineart/**/*.scss', ['sass-ravenfineart-watch']);
gulp.watch(config.buildDir + '/js/**/*.js', ['js-watch']);
});

gulp.task('default', gulpSequence(['serve', 'images'], 'minify-css'));

//END GULP.JS
