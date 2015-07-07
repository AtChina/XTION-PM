/**
 * Author:      changyingwei
 * Create Date: 2015-03-27
 * Description: 监听前端工程文件修改自动执行jshint、livereload操作
 */
var port = 35729,
    Q = require('q'),
    fs = require('fs'),
    gulp = require('gulp'),
    path = require('path'),
    util = require('util'),
    map = require('map-stream'),
    server = require('../launch'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    livereload = require('gulp-livereload'),
    autoOpenBrowser = process.argv[2] !== 'restart';

Q.fcall(function() { //第一步：监听浏览器自动刷新端口
    var deferred = Q.defer();
    livereload.listen({
        port: port,
        start: true
    });
    deferred.resolve(true);
    return deferred.promise;
}).then(function() { //第二步：启动Web服务器，并注入插件
    var deferred = Q.defer();
    server.start([function(opts) {
        return require('connect-livereload')({ //注入livereload中间件
            port: port
        });
    }, function(opts) {
        opts.isCluster = false;
        opts.openBrowser = function(serverURL) { //注入openBrowser中间件
            if (autoOpenBrowser) {
                require('open')(serverURL);
            }
        };
        return function(req, res, next) {
            next();
        };
    }]);
    deferred.resolve(true);
    return deferred.promise;
}).then(function() { //第三步：监控文件修改结果，执行代码审查，然后重启服务器或者刷新浏览器
    var watchDone = function(isServer, filepath) {
        if (isServer) {
            process.stdout.write(util.format('\x1b[36m%s\x1b[0m', filepath));
            process.stdout.write(util.format('\x1b[33m%s\x1b[0m', ' changed!server is restarting...\n'));
            process.send('restart'); //重启服务器
        } else {
            livereload.reload(); //刷新浏览器
        }
    };
    //监控文件修改结果，执行代码审查，然后重启服务器或者刷新浏览器
    gulp.watch([
        './*.js',
        './*.html',
        './app/**/*.js',
        './assets/**/*.css',
        './components/**/*.html',
        './data/**/*.json',
        './views/**/*.html',
        './config/**/*.yml',
        '../Server/*.js',
        '../Server/tasks/**/*.js',
        '../Server/lib/**/*.js'
    ], function(event) {
        var extension = path.extname(event.path),
            isServer = event.path.split(process.cwd()).length === 1 || extension === '.yml';
        if (extension === '.js') {
            gulp.src(event.path)
                .pipe(jshint()) //执行代码审查
                .pipe(jshint.reporter(stylish))
                .pipe(map(function(file, callback) {
                    if (file.jshint.success) {
                        watchDone(isServer, event.path);
                    }
                }));
        } else {
            watchDone(isServer, event.path);
        }
    });
}).catch(function(error) {
    process.stdout.write(util.format('\x1b[31m%s\x1b[0m', '  failed!\n\n'));
    console.log(colors.red.bold(error.message)); //处理错误
}).done();
