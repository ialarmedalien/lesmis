/* jshint node: true */
"use strict";

var gulp = require( "gulp" ),
  /** @type {Object} Loader of Gulp plugins from `package.json` */
  p = require( "gulp-load-plugins" )(),
  currdir = process.cwd(),
  cssfile  = 'lesmis.css',
  sassfile = 'lesmis.scss',
  jsfile   = 'lesmis.js',
  sass = require('gulp-sass'),
  /** @type {Object of Array} CSS source files to concatenate and minify */
  cssminSrc = [
        /** Normalize */
        "node_modules/normalize.css/normalize.css",
        /** Theme style */
        "css/" + cssfile
    ],
  /** @type {String} Used inside task for set the mode to 'development' or 'production' */
  env = (function() {
    /** @type {String} Default value of env */
    var env = "development";

    /** Test if there was a different value from CLI to env
      Example: gulp styles --env=production
      When ES6 will be default. `find` will replace `some`  */
    process.argv.some(function( key ) {
      var matches = key.match( /^\-{2}env\=([A-Za-z]+)$/ );

      if ( matches && matches.length === 2 ) {
        env = matches[1];
        return true;
      }
    });
    return env;
  })(),
  onError = function(err) {
    console.log(err);
  };

/** CSS Preprocessors */

gulp.task('libsass', function () {
  return gulp.src('./sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest( 'css/'));
});

gulp.task('sass:watch', function () {
  gulp.watch('./sass/**/*.scss', ['styles']);
});

/** STYLES */
gulp.task( "styles", [ "libsass" ], function() {
  console.log( "`styles` task run in `" + env + "` environment" );
  var stream = gulp.src( cssminSrc )
    .pipe( p.plumber({ errorHandler: onError }))
    .pipe( p.concat( cssfile )) // cssminSrc will be concat'd into cssfile
//    .pipe( p.autoprefixer( "last 2 version" ) )
//    .pipe( p.pixrem( 16, { atrules: true }) )
//    .pipe( gulp.dest( source + 'css/' ) ); // save here
    ;

  if ( env === "production" ) {
  //  minifier
    stream = stream.pipe( p.csso() );
  }

  return stream.on( "error", function( e ) {
    console.error( e );
  })
  .pipe( gulp.dest( 'css/' ) );
});

/** `env` to 'production' */
gulp.task( "envProduction", function() {
  env = "production";
});
