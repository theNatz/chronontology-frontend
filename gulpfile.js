var gulp = require('gulp');
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var url = require('url');
var proxy = require('proxy-middleware');
var modRewrite = require('connect-modrewrite');
var reload = browserSync.reload;
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var sort = require('gulp-sort');
var addSrc = require('gulp-add-src');
var minifyCss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var argv = require('yargs').argv;
var ngHtml2Js = require("gulp-ng-html2js");
var minifyHtml = require("gulp-minify-html");
var replace = require('gulp-replace');

var pkg = require('./package.json');

var cfg = require('./dev-config.json');

var paths = cfg.paths;

var cssDeps = [
    //paths.lib + 'bootstrap-css-only/css/bootstrap.min.css'
];

var jsDeps = [
    paths.lib + 'file-saver/FileSaver.min.js',
    paths.lib + 'd3/d3.min.js',
    paths.lib + 'leaflet/dist/leaflet.js',
    paths.lib + 'leaflet-fullscreen/dist/Leaflet.fullscreen.min.js',
    paths.lib + 'leaflet.markercluster/dist/leaflet.markercluster.js',
    paths.lib + 'turf/turf.min.js',
    paths.lib + 'angular/angular.min.js',
    paths.lib + 'angular-route/angular-route.min.js',
    paths.lib + 'angular-ui-bootstrap/dist/ui-bootstrap.js',
    paths.lib + 'angular-resource/angular-resource.min.js',
    paths.lib + 'angular-i18n/angular-locale_de-de.js',
    paths.lib + 'angular-ui-scroll/dist/ui-scroll-jqlite.js',
    paths.lib + 'angular-ui-scroll/dist/ui-scroll.js',
    paths.lib + 'angulartics/dist/angulartics.min.js',
    paths.lib + 'angulartics-piwik/dist/angulartics-piwik.min.js',
    paths.lib + 'idai-components/dist/idai-components.min.js'
];

gulp.task('compile-css', function () {

    return gulp.src('scss/app.scss')
        .pipe(sass({
            includePaths: [
                'node_modules/bootstrap-sass/assets/stylesheets/',
                'node_modules/idai-components/src/'
            ],
            precision: 8
        }))
        .pipe(addSrc(cssDeps))
        .pipe(concat(pkg.name + '.css'))
        .pipe(gulp.dest(paths.build + '/css'))
        .pipe(reload({stream: true}));
});

// minify css files in build dir
gulp.task('minify-css', ['compile-css'], function () {

    return gulp.src('dist/css/*.css')
        .pipe(minifyCss())
        .pipe(concat(pkg.name + '.min.css'))
        .pipe(gulp.dest('dist/css'));
});

// concatenates and minifies all dependecies into a single file in build dir
gulp.task('concat-deps', function () {

    return gulp.src(jsDeps)
        .pipe(concat(pkg.name + '-deps.js'))
        //.pipe(uglify())
        .pipe(gulp.dest('dist/js/'));
});

// concatenates all js files in src into a single file in build dir
gulp.task('concat-js', function () {

    return gulp.src(['js/**/*.js'])
        .pipe(sort())
        .pipe(concat(pkg.name + '.js'))
        .pipe(gulp.dest('dist/js/'))
        .pipe(reload({stream: true}));
});

// converts, minifies and concatenates html partials
// to a single js file in build dir
gulp.task('html2js', function () {

    return gulp.src('partials/**/*.html')
        .pipe(minifyHtml())
        .pipe(ngHtml2Js({moduleName: pkg.name + '.templates', prefix: 'partials/'}))
        .pipe(concat(pkg.name + '-tpls.js'))
        .pipe(gulp.dest('dist/js'));
});

// minifies and concatenates js files in build dir
gulp.task('minify-js', ['concat-js', 'html2js'], function () {

    return gulp.src([paths.build + 'js/' + pkg.name + '.js',
        paths.build + pkg.name + '-tpls.js'])
        .pipe(concat(pkg.name + '.js'))
        .pipe(gulp.dest(paths.build + 'js'))
        .pipe(uglify())
        .pipe(concat(pkg.name + '.min.js'))
        .pipe(gulp.dest(paths.build + 'js'));
});

gulp.task('copy-fonts', function () {

    var bsFontPath = paths.lib + 'bootstrap-sass/assets/fonts/';
    return gulp.src(bsFontPath + '**/*', {base: bsFontPath})
        .pipe(gulp.dest(paths.build + '/fonts'));
});

gulp.task('copy-imgs', function () {

    return gulp.src('img/**/*', {base: 'img'})
        .pipe(gulp.dest(paths.build + '/img'));
});

gulp.task('copy-partials', function () {

    return gulp.src('partials/**/*', {base: 'partials'})
        .pipe(gulp.dest(paths.build + '/partials'));
});

gulp.task('copy-resources', ['copy-fonts', 'copy-imgs', 'copy-index', 'copy-info', 'copy-config', 'copy-partials']);

// copy index.html to dist and set version
gulp.task('copy-index', function () {

    var buildNo = "SNAPSHOT";
    if (argv.build) buildNo = argv.build;
    var versionString = pkg.version + " (build #" + buildNo + ")";
    gulp.src(['index.html'])
        .pipe(replace(/version="[^"]*"/g, 'version="v' + versionString + '"'))
        .pipe(replace(/build=BUILD_NO/g, 'build=' + buildNo))
        .pipe(gulp.dest(paths.build));
});

gulp.task('copy-info', function () {

    return gulp.src('info/**/*', {base: 'info'})
        .pipe(gulp.dest(paths.build + '/info'));
});

gulp.task('copy-config', function () {

    return gulp.src('config/**/*', {base: 'config'})
        .pipe(gulp.dest(paths.build + '/config'));
});

gulp.task('build', [
    'minify-css',
    'concat-deps',
    'minify-js',
    'copy-resources'
]);

// clean
gulp.task('clean', function () {

    return del(paths.build + '/**/*');
});

// runs the development server and sets up browser reloading
gulp.task('server', ['compile-css', 'minify-js', 'concat-deps', 'copy-resources'], function () {

    var proxyOptions = url.parse(cfg.backendUri);
    proxyOptions.route = '/data';

    browserSync({
        server: {
            baseDir: 'dist',
            middleware: [
                proxy(proxyOptions),
                // rewrite for AngularJS HTML5 mode, redirect all non-file urls to index.html
                modRewrite(['!\\.html|\\.js|\\.svg|\\.css|\\.png|\\.jpg|\\.gif|\\.json|\\.woff2|\\.woff|\\.ttf$ /index.html [L]']),
            ]
        },
        port: 1238
    });

    gulp.watch('scss/**/*.scss', ['compile-css']);
    gulp.watch('js/**/*.js', ['minify-js']);
    gulp.watch('partials/**/*.html', ['copy-partials']);
    gulp.watch('index.html', ['copy-index']);

    gulp.watch(['index.html', 'partials/**/*.html', 'js/**/*.js'], reload);
});

gulp.task('default', function () {
    runSequence('clean', 'build');
});
