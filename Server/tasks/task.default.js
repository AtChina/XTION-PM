/**
 * Author:      changyingwei
 * Create Date: 2015-03-24
 * Description: 默认工作流，用于启动本地开发服务，监控文件编辑保存后检查语法、自动刷新浏览器和重启动服务
 */
module.exports = function() {
    'use strict';

    var watch = __dirname + '/task.watch.js',
        server = require('child_process').fork(watch);

    //线程重启
    var reStart = function(message) {
        if (message === 'restart') {
            server.kill();
            server = require('child_process').fork(watch, ['restart']);
            server.on('message', function(message) {
                reStart(message);
            });
        }
    };
    //监听线程重启
    server.on('message', function(message) {
        reStart(message);
    });
    //退出进程
    process.on('SIGINT', function() {
        server.kill();
        process.exit();
    });
};
