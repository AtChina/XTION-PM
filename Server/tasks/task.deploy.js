/**
 * Author:      changyingwei
 * Create Date: 2015-03-26  
 * Description: 一键自动化部署前端工程到远程服务器，支持多台服务器同时部署
 */
module.exports = function() {
    'use strict';

    var Q = require('q'),
        del = require('del'),
        gulp = require('gulp'),
        util = require('util'),
        Client = require('ssh2').Client; //加载工作流插件

    Q.fcall(function() { //第一步：执行publish任务
            var deferred = Q.defer();
            require('./task.publish')(function(fileObj) {
                deferred.resolve(fileObj);
            });
            return deferred.promise;
        }).then(function(file) { //第二步,远程部署服务器Web站点
            var develop = {
                    host: '192.168.0.X',
                    port: 22,
                    username: 'root',
                    password: '123456',
                    deploypath: '/home/xtionweb',
                    description: '前端测试站(CentOS5.5)'
                },
                test = {
                    host: '192.168.0.X',
                    port: 22,
                    username: 'root',
                    password: '123456',
                    deploypath: '/home/xtionweb',
                    description: '品管测试环境(CentOS6.5)'
                },
                hosts = [process.argv[3] && process.argv[3] === 'test' ? test : develop];

            process.stdout.write(util.format('\x1b[37m%s', '20)'));
            process.stdout.write(util.format('\x1b[33m%s\x1b[0m', ' connection to remote server,then upload deploy zip file and finish auto deploy.\n\n'));
            hosts.forEach(function(server) {
                var conn = new Client();
                Q.fcall(function() { //第三步：连接远程服务器
                    var deferred = Q.defer();
                    conn.on('ready', function() {
                        deferred.resolve(true);
                    }).connect(server);
                    return deferred.promise;
                }).then(function(success) { //第四步：链接远程服务器
                    if (success) {
                        var deferred = Q.defer();
                        process.stdout.write(util.format('\x1b[37m%s', '   1)'));
                        process.stdout.write(util.format('\x1b[33m%s\x1b[0m', ' connection to remote server', server.host, '...'));
                        conn.sftp(function(err, sftp) {
                            if (err) {
                                process.stdout.write(util.format('\x1b[31m%s\x1b[0m', '  failed!\n\n'));
                                deferred.reject(new Error(err));
                            } else {
                                process.stdout.write(util.format('\x1b[32m%s\x1b[0m', '  successful!\n\n'));
                                deferred.resolve(sftp);
                            }
                        });
                        return deferred.promise;
                    }
                }).then(function(sftp) { //第五步：上传文件到服务器
                    if (sftp) {
                        var deferred = Q.defer();
                        process.stdout.write(util.format('\x1b[37m%s', '   2)'));
                        process.stdout.write(util.format('\x1b[33m%s\x1b[0m', ' transferring file to remote server', server.host, '...'));
                        sftp.fastPut(file.filePath, file.filename, {}, function(err) {
                            if (err) {
                                process.stdout.write(util.format('\x1b[31m%s\x1b[0m', '  failed!\n\n'));
                                deferred.reject(new Error(err));
                            } else {
                                process.stdout.write(util.format('\x1b[32m%s\x1b[0m', '  successful!\n\n'));
                                deferred.resolve(true);
                            }
                        });
                        return deferred.promise;
                    }
                }).then(function(success) { //第六步：在远程服务器上解压部署文件
                    if (success) {
                        var deferred = Q.defer();
                        process.stdout.write(util.format('\x1b[37m%s', '   3)'));
                        process.stdout.write(util.format('\x1b[33m%s\x1b[0m', ' unzip deploy file on remote server...'));
                        conn.exec(util.format('unzip -o %s', file.filename), function(err, stream) {
                            if (err) {
                                process.stdout.write(util.format('\x1b[31m%s\x1b[0m', '  failed!\n\n'));
                                deferred.reject(new Error(err));
                            } else {
                                process.stdout.write(util.format('\x1b[32m%s\x1b[0m', '  successful!\n\n'));
                                deferred.resolve(true);
                            }
                        });
                        return deferred.promise;
                    }
                }).then(function(success) { //第七步：清除zip部署文件包
                    if (success) {
                        var deferred = Q.defer();
                        process.stdout.write(util.format('\x1b[37m%s', '   4)'));
                        process.stdout.write(util.format('\x1b[33m%s\x1b[0m', ' clean deploy file...'));
                        conn.exec(util.format('rm -rf %s', file.filename), function(err, stream) {
                            if (err) {
                                process.stdout.write(util.format('\x1b[31m%s\x1b[0m', '  failed!\n\n'));
                                deferred.reject(new Error(err));
                            } else {
                                process.stdout.write(util.format('\x1b[32m%s\x1b[0m', '  successful!\n\n'));
                                deferred.resolve(true);
                            }
                        });
                        return deferred.promise;
                    }
                }).then(function(success) { //第八步：先关闭Nodejs服务进程
                    if (success) {
                        var deferred = Q.defer();
                        process.stdout.write(util.format('\x1b[37m%s', '   5)'));
                        process.stdout.write(util.format('\x1b[33m%s\x1b[0m', ' stop nodejs web server...'));
                        conn.exec("ps -ef | grep node | grep -v grep |awk '{print $2}' | xargs kill -9", function(err, stream) {
                            if (err) {
                                process.stdout.write(util.format('\x1b[31m%s\x1b[0m', '  failed!\n\n'));
                                deferred.reject(new Error(err));
                            } else {
                                process.stdout.write(util.format('\x1b[32m%s\x1b[0m', '  successful!\n\n'));
                                deferred.resolve(true);
                            }
                        });
                        return deferred.promise;
                    }
                }).then(function(success) { //第九步：重启web服务容器，完成自动化部署
                    if (success) {
                        var deferred = Q.defer();
                        process.stdout.write(util.format('\x1b[37m%s', '   6)'));
                        process.stdout.write(util.format('\x1b[33m%s\x1b[0m', ' restart nodejs web server to complete deploy...'));
                        conn.shell(function(err, stream) {
                            if (err) {
                                process.stdout.write(util.format('\x1b[31m%s\x1b[0m', '  failed!\n\n'));
                                deferred.reject(new Error(err));
                            } else {
                                process.stdout.write(util.format('\x1b[32m%s\x1b[0m', '  successful!\n\n'));
                                stream.on('readable', function() {
                                    process.stdout.write(util.format('\x1b[32m%s\x1b[0m', '    deploy successful!'));
                                    deferred.resolve(true);
                                });
                                stream.write('cd FRONT-END/Client/ && nohup node main.js >/dev/null 2>&1 &\r\n');
                                stream.end();
                            }
                        });
                        return deferred.promise;
                    }
                }).catch(function(error) {
                    process.stdout.write(util.format('\x1b[31m%s\x1b[0m', '  failed!\n\n'));
                    console.log(colors.red.bold(error.message)); //处理错误
                }).done();
            });
        }).catch(function(error) {
            process.stdout.write(util.format('\x1b[31m%s\x1b[0m', '  failed!\n\n'));
            console.log(colors.red.bold(error.message)); //处理错误
        })
        .done();
};
