/**
 * Author:      changyingwei
 * Create Date: 2014-12-01
 * Description: 前端服务器启动入口程序
 */
module.exports.start = function() {
    'use strict';

    var tasks = require('./tasks')(); //加载任务列表

    tasks[process.argv[2] || 'default']();
};
