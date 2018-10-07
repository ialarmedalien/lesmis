// Karma configuration
// Generated on Fri Oct 05 2018 21:56:52 GMT+0100 (BST)

require("reify")

const rollupConf = require('./rollup.config.js')

console.log( rollupConf.default );

delete rollupConf.default.input

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      { pattern: 'js/d3.v5.js', watched: false },
      { pattern: 'js/keylines.js', watched: false },
      'test/*.js'
    ],


    // list of files / patterns to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'test/*.js': [ 'rollup' ]
    },

    rollupPreprocessor: rollupConf.default /* {
      plugins: [require('rollup-plugin-buble')()],
      output: {
        format: 'iife',
        name: 'lesmis',
        sourcemap: 'inline',
        globals: {
          d3: 'd3'
        }
      }
    } */
    ,
    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [
      'Firefox',
      'Chrome',
      'PhantomJS'
    ],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}