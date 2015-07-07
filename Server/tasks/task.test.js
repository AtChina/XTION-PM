/**
 * Author:      changyingwei
 * Create Date: 2015-03-24  
 * Description: 自动化测试工作流，karma默认配置项如下：
 * {
        LOG_DISABLE: 'OFF',
        LOG_ERROR: 'ERROR',
        LOG_WARN: 'WARN',
        LOG_INFO: 'INFO',
        LOG_DEBUG: 'DEBUG',
        set: [Function],
        frameworks: [],
        port: 9876,
        hostname: 'localhost',
        basePath: '',
        files: [],
        exclude: [],
        logLevel: 'INFO',
        colors: true,
        autoWatch: true,
        autoWatchBatchDelay: 250,
        usePolling: false,
        reporters: ['progress'],
        singleRun: false,
        browsers: [],
        captureTimeout: 60000,
        proxies: {},
        proxyValidateSSL: true,
        preprocessors: {},
        urlRoot: '/',
        reportSlowerThan: 0,
        loggers: [{
            type: 'console',
            layout: [Object],
            makers: [Object]
        }],
        transports: ['websocket', 'flashsocket', 'xhr-polling', 'jsonp-polling'],
        plugins: ['karma-*'],
        client: {
            args: [],
            useIframe: true,
            captureConsole: true
        },
        defaultClient: {
            args: [],
            useIframe: true,
            captureConsole: true
        },
        browserDisconnectTimeout: 2000,
        browserDisconnectTolerance: 0,
        browserNoActivityTimeout: 10000
    }
 */
module.exports = function() {
    'use strict';

    var karma = require('karma').server;

    //启动测试任务
    karma.start({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: process.cwd(),

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine', 'requirejs'],

        // list of files / patterns to load in the browser
        files: [{
                pattern: 'bower_components/**/*.js',
                included: false,
                watched: false,
                served: true
            }, {
                pattern: 'app/**/*.js',
                included: false,
                watched: true,
                served: true
            }, {
                pattern: 'assets/**/*.js',
                included: false,
                watched: true,
                served: true
            }, {
                pattern: 'test/**/*+(Spec|spec|test).js',
                included: false,
                watched: true,
                served: true
            },
            'test/test-main.js'
        ],

        // list of files to exclude
        exclude: [
            'app/app.js'
        ],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'app/**/*.js': 'coverage',
            'assets/**/*.js': 'coverage'
        },

        coverageReporter: {
            type: 'html',
            dir: 'test/coverage/'
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        // possible values: progress||mocha||coverage||verbose
        reporters: ['mocha', 'coverage'],

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: 'INFO',

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Chrome'],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false
    });
};
