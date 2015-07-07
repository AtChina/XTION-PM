/**
 * Author:      changyingwei
 * Create Date: 2015-03-25
 * Description: 前端工程打包工作流
 */
module.exports = function(callback) {
    'use strict';

    var Q = require('q'),
        del = require('del'),
        path = require('path'),
        util = require('util'),
        gulp = require('gulp'),
        zip = require('gulp-zip'),
        rename = require("gulp-rename"),
        colors = require('colors/safe'),
        dateFormat = require('dateformat'),
        zipfile = 'FRONT-END-' + dateFormat(new Date(), "yyyy-mm-dd-HH-MM-ss") + '.zip';

    Q.fcall(function() { //第一步：执行build任务
            var deferred = Q.defer();
            require('./task.build')(function(success) {
                deferred.resolve(true);
            });
            return deferred.promise;
        }).then(function(success) { //第二步：清空发布目录
            if (success) {
                var deferred = Q.defer();
                process.stdout.write(util.format('\x1b[37m%s', '16)'));
                process.stdout.write(util.format('\x1b[33m%s\x1b[0m', ' cleaning zipfiles directory...'));
                del(['zipfiles'], function() {
                    process.stdout.write(util.format('\x1b[32m%s\x1b[0m', '  successful!\n\n'));
                    deferred.resolve(true);
                });
                return deferred.promise;
            }
        }).then(function(success) { //第三步：移动Server文件，移除不需要的文件
            if (success) {
                var deferred = Q.defer();
                process.stdout.write(util.format('\x1b[37m%s', '17)'));
                process.stdout.write(util.format('\x1b[33m%s\x1b[0m', ' copy server directory to dist directory...'));
                gulp.src(['../Server/**', '!package.json', '!README.md', '!index.js'])
                    .pipe(gulp.dest('dist/FRONT-END/Server'))
                    .on('finish', function() {
                        var pkg = require('../package.json');
                        var dellist = [
                            'dist/FRONT-END/Server/README.md',
                            'dist/FRONT-END/Server/index.js',
                            'dist/FRONT-END/Server/package.json',
                            'dist/FRONT-END/Server/tasks'
                        ];
                        var depen = Object.keys(pkg.devDependencies).map(function(c) {
                            return 'dist/FRONT-END/Server/node_modules/' + c;
                        });
                        del(dellist.concat(depen), function() {
                            process.stdout.write(util.format('\x1b[32m%s\x1b[0m', '  successful!\n\n'));
                            deferred.resolve(true);
                        });
                    })
                    .on('error', function(error) {
                        process.stdout.write(util.format('\x1b[31m%s\x1b[0m', '  failed!\n\n'));
                        deferred.reject(new Error(error));
                    });
                return deferred.promise;
            }
        }).then(function(success) { //第四步：修改服务器启动配置
            if (success) {
                var deferred = Q.defer();
                process.stdout.write(util.format('\x1b[37m%s', '18)'));
                process.stdout.write(util.format('\x1b[33m%s\x1b[0m', ' modify the server config...'));
                gulp.src('dist/FRONT-END/Server/launch.js')
                    .pipe(rename({
                        basename: 'index',
                        extname: '.js'
                    }))
                    .pipe(gulp.dest('dist/FRONT-END/Server'))
                    .on('finish', function() {
                        del('dist/FRONT-END/Server/launch.js', function() {
                            process.stdout.write(util.format('\x1b[32m%s\x1b[0m', '  successful!\n\n'));
                            deferred.resolve(true);
                        });
                    })
                    .on('error', function(error) {
                        process.stdout.write(util.format('\x1b[31m%s\x1b[0m', '  failed!\n\n'));
                        deferred.reject(new Error(error));
                    });
                return deferred.promise;
            }
        }).then(function(success) { //第五步：打包zip文件
            if (success) {
                var deferred = Q.defer();
                process.stdout.write(util.format('\x1b[37m%s', '19)'));
                process.stdout.write(util.format('\x1b[33m%s\x1b[0m', ' zip packing...'));
                gulp.src('dist/**')
                    .pipe(zip(zipfile))
                    .pipe(gulp.dest('zipfiles'))
                    .on('finish', function() {
                        del('dist', function() {
                            process.stdout.write(util.format('\x1b[32m%s\x1b[0m', '  successful!\n\n'));
                            deferred.resolve(true);
                            if (callback)
                                callback({
                                    filePath: path.join(process.cwd(), 'zipfiles/' + zipfile),
                                    filename: zipfile
                                });
                        });
                    })
                    .on('error', function(error) {
                        process.stdout.write(util.format('\x1b[31m%s\x1b[0m', '  failed!\n\n'));
                        deferred.reject(new Error(error));
                    });
                return deferred.promise;
            }
        })
        .catch(function(error) {
            process.stdout.write(util.format('\x1b[31m%s\x1b[0m', '  failed!\n\n'));
            console.log(colors.red.bold(error.message)); //处理错误
        })
        .done();
};
