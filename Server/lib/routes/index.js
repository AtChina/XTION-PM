/**
 * Author:      changyingwei
 * Create Date: 2014-12-01
 * Description: 前端动态路由服务
 */
module.exports.routerRegister = function(express, routesTable) {
    'use strict';

    var path = require('path'),
        util = require('util'),
        router = express.Router(),
        mime = require('mime-types'),
        proxy = require('../controllers/controller.proxy');

    //根据路由表定义，注册路由,通过viewroot和apiroot正则匹配来模拟nginx转发请求
    routesTable.filter(function(route, index, source) {
        if (route.enableroute && route.routepath && route.httpmethod) {
            return true;
        }
        return false;
    }).forEach(function(route) {
        router[route.httpmethod](route.routepath, function(req, res) {
            var apimatch = new RegExp(req.config.apiroot, 'i'),
                viewmatch = new RegExp(req.config.viewroot, 'i'),
                confmatch = new RegExp(req.config.confroot, 'i'),
                baseURL = 'http://' + req.config.gateway.host + ':' + req.config.gateway.port;

            route.proxy = false;
            route.extension = path.extname(req.url);
            route.authorized = route.authorized || req.authorized;
            if (viewmatch.test(route.routepath)) {
                route.target = 'view'; //视图路由请求
            } else if (apimatch.test(route.routepath) || confmatch.test(route.routepath)) {
                route.target = 'api';
                route.proxy = req.config.runmode !== 'development';
                route.httpmethod = route.httpmethod === 'delete' ? 'del' : route.httpmethod;
                if (route.extension) {
                    req.headers["Content-Type"] = route.extension ? mime.contentType(route.extension) : mime.contentType('.json');
                    //本地请求,从本地读取JSON协议
                    if (req.config.localconf && route.extension === '.json') {
                        route.proxy = false;
                        route.physical_file = req.url.replace(confmatch, '/data');
                    } else {
                        //代理请求，从服务器读取JSON协议
                        req.url = baseURL + req.url;
                    }
                } else {
                    //API路由请求
                    req.url = baseURL + route.routepath;
                }

            } else {
                route.authorized = true;
                route.target = 'test'; //测试页面路由请求
            }
            if (route.authorized) {
                proxy.handleRequest(req, res, route); //代理请求
            } else {
                res.render(req.config.loginpage);
            }
        });
    });
    return router;
};
