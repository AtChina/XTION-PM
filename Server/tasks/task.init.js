/**
 * Author:      changyingwei
 * Create Date: 2015-03-25  
 * Description: 初始化前端bower和npm安装包
 */
module.exports = function() {
    'use strict';

    var Q = require('q'),
        util = require('util'),
        exec = require('child_process').exec;

    Q.fcall(function() { //第一步：npm依赖安装
            var deferred = Q.defer();
            process.stdout.write(util.format('\x1b[36m%s', '\nFRONT-END AUTO WORKFLOW STEPS:\n\n'));
            process.stdout.write(util.format('\x1b[37m%s', '1)'));
            process.stdout.write(util.format('\x1b[33m%s\x1b[0m', ' npm dependents installing...'));
            exec('cd ../Server && npm install', function(error, stdout, stderr) {
                process.stdout.write(util.format('\x1b[32m%s\x1b[0m', '  successful!\n\n'));
                deferred.resolve(true);
            });
            return deferred.promise;
        }).then(function(success) { //第二步,检查git
            var deferred = Q.defer();
            exec('cmd.exe /c git --version',
                function(error, stdout, stderr) {
                    process.stdout.write(util.format('\x1b[37m%s', '2)'));
                    if (!/^git version/.test(stdout)) {
                        console.log('\x1b[31m%s\x1b[0m', ' Please install git from this url:http://www.git-scm.com/downloads');
                        deferred.reject(false);
                    } else {
                        console.log('\x1b[32m%s\x1b[0m', ' Git had installed.\n');
                        deferred.resolve(true);
                    }
                });
            return deferred.promise;
        }).then(function(success) { //第三步,检查bower
            exec('cmd.exe /c bower --version',
                function(error, stdout, stderr) {
                    process.stdout.write(util.format('\x1b[37m%s', '3)'));
                    process.stdout.write(util.format('\x1b[33m%s\x1b[0m', ' bower dependents installing...'));
                    if (!/[1-9].[1-9].[1-9]/.test(stdout)) {
                        exec('npm install bower -g', function(error, stdout, stderr) {
                            exec('cd ../Client && bower install', function(error, stdout, stderr) {
                                process.stdout.write(util.format('\x1b[32m%s\x1b[0m', '  successful!'));
                            });
                        });
                    } else {
                        if (success) {
                            exec('cd ../Client && bower install', function(error, stdout, stderr) {
                                process.stdout.write(util.format('\x1b[32m%s\x1b[0m', '  successful!\n'));
                            });
                        }
                    }
                });
        }).catch(function(error) {
            process.stdout.write(util.format('\x1b[31m%s\x1b[0m', '  failed!\n\n'));
            console.log(colors.red.bold(error.message)); //处理错误
        })
        .done();
};
