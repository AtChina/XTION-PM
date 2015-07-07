/**
 * Author:      changyingwei
 * Create Date: 2014-12-01
 * Description: 启动服务,初始化服务设置
 * @param  {[type]} injector 第三方中间件注入列表
 * @return {[type]}          [description]
 */
module.exports.start = function(injector) {
    'use strict';

    var yamljs = require('yamljs'),
        apppath = process.cwd(), //获取当前app执行所在目录
        server = require(__dirname + '/lib/server'), //加载服务器容器
        config = yamljs.load(apppath + '/config/config.yml'); //加载配置文件

    config.default.apppath = apppath; //设置APP目录
    config.default.apiRoutesTable = yamljs.load(apppath + '/config/route.api.yml'); //加载API路由配置（用于本地联调测试）
    config.default.viewRoutesTable = yamljs.load(apppath + '/config/route.view.yml'); // 加载视图路由配置

    server.init(config, injector); //初始化并启动服务器
};
