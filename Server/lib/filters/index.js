/**
 * Author:      changyingwei
 * Create Date: 2014-12-01  
 * Description: 前端过滤器
 */
module.exports.filterRegister = function(express, config) {
    'use strict';

    var router = express.Router(), //自定义过滤器
        request = require('request'),
        serveIndex = require('serve-index');

    //首页和登录页路由
    router.get('/', function(req, res) {
        if (req.authorized) {
            res.render(config.homepage);
        } else {
            res.render(config.loginpage);
        }
    });
    return router;
};
