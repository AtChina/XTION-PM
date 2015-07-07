/**
 * Author:      changyingwei
 * Create Date: 2014-12-01
 * Description: 前端控制器
 */
var fs = require('fs'),
    ejs = require('ejs'),
    path = require('path'),
    request = require('request');

/**
 * 本地api请求
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} route [description]
 * @return {[type]}       [description]
 */
var apiHandler = function(req, res, route) {
    var filepath = path.join(req.config.apppath, route.physical_file),
        stream;

    if (route.responetype === 'file') {
        res.download(filepath);
    } else {
        stream = fs.createReadStream(filepath, {
            flags: "r",
            encoding: null
        });
        stream.on("error", function(err) {
            req.app.log4.warn(err);
            res.status(500).end({
                "request_id": parseInt(10 * Math.random()),
                "error_code": 5000202,
                "error_msg": err
            });
        });
        stream.pipe(res);
    }
};

/**
 * 视图请求路由处理
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} route [description]
 * @return {[type]}       [description]
 */
var viewHandler = function(req, res, route) {
    if (route.responetype === 'file') {
        apiHandler(req, res, route);
    } else {
        res.render(route.physical_file);
    }
};

/**
 * EJS渲染页面
 * @param  {[type]} filepath [description]
 * @return {[type]}          [description]
 */
var ejsRenderHtml = function(filepath, res) {
    ejs.renderFile(filepath, {}, function(err, html) {
        res.send(html);
    });
};

/**
 * 测试请求处理器
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} route [description]
 * @return {[type]}       [description]
 */
var testHandler = function(req, res, route) {
    if (route.extension === '.html') {
        ejsRenderHtml(path.join(req.config.apppath, req.url), res);
    } else {
        ejsRenderHtml(path.join(req.config.apppath, route.physical_file), res);
    }
};

/**
 * 处理请求
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} route [description]
 * @return {[type]}       [description]
 */
module.exports.handleRequest = function(req, res, route) {
    'use strict';

    if (route.proxy) {
        req.pipe(request[route.httpmethod](req.url)).pipe(res);
    } else {
        switch (route.target) {
            case 'view':
                viewHandler(req, res, route);
                break;
            case 'api':
                apiHandler(req, res, route);
                break;
            case 'test':
                testHandler(req, res, route);
                break;
        }
    }
};
