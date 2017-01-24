'use strict';

var gulp       = require('gulp');
// var less    = require('gulp-less');
var sass       = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var watch      = require('gulp-watch');
var batch      = require('gulp-batch');
var plumber    = require('gulp-plumber');
var jetpack    = require('fs-jetpack');
var bundle     = require('./bundle');
var utils      = require('./utils');

var projectDir = jetpack;
var srcDir     = jetpack.cwd('./src');
var destDir    = jetpack.cwd('./app');

gulp.task('bundle', function () {
    return Promise.all([
        bundle(srcDir.path('background.js'), destDir.path('background.js')),
        bundle(srcDir.path('app.js'), destDir.path('app.js')),
        bundle(srcDir.path('preferences.js'), destDir.path('preferences.js')),
    ]);
});

gulp.task('sass', function () {
    return gulp.src(srcDir.path('stylesheets/main.sass'))
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'compressed',
            includePaths: [
                'node_modules/bootstrap-sass/assets/stylesheets/',
                'node_modules/bootswatch-sass/',
            ]
        }).on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(destDir.path('stylesheets')));
});

gulp.task('environment', function () {
    var configFile = 'config/env_' + utils.getEnvName() + '.json';
    projectDir.copy(configFile, destDir.path('env.json'), { overwrite: true });
});

gulp.task('watch', function () {
    var beepOnError = function (done) {
        return function (err) {
            if (err) {
                utils.beepSound();
            }
            done(err);
        };
    };

    watch('src/**/*.js', batch(function (events, done) {
        gulp.start('bundle', beepOnError(done));
    }));
    // watch('src/**/*.less', batch(function (events, done) {
    //     gulp.start('less', beepOnError(done));
    // }));
    watch('src/**/*.sass', batch(function (events, done) {
        gulp.start('sass', beepOnError(done));
    }));
});

gulp.task('build', ['bundle', /*'less',*/ 'sass', 'environment']);
