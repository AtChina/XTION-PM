/**
 * Author:      changyingwei
 * Create Date: 2014-12-01
 * Description: 前端web服务器容器
 */

var fs = require('fs'),
    ejs = require('ejs'),
    path = require('path'),
    http = require('http'),
    _ = require('underscore'),
    log4js = require('log4js'),
    logger = require('morgan'),
    cluster = require('cluster'),
    express = require('express'),
    routers = require('./routes'),
    filters = require('./filters'),
    app = module.exports = express(),
    favicon = require('serve-favicon'),
    errorHandler = require('errorhandler'),
    cookieParser = require('cookie-parser'),
    methodOverride = require('method-override');

/**
 * 路由列表合并处理
 * @param  {[type]} routes [description]
 * @return {[type]}        [description]
 */
var mergeRoute = function(routes) {
    var routeTables = [],
        route;

    Object.keys(routes).forEach(function(key) {
        route = routes[key];
        if (route instanceof Array) {
            route.forEach(function(cur) {
                routeTables.push(cur);
            });
        } else {
            routeTables.push(route);
        }
    });

    return routeTables;
};

/**
 * 解析配置文件
 * @param  {[type]} options [配置数据]
 * @return {[type]}         [环境配置对象]
 */
var setup = function(options) {
    var dfConfig = options.default,
        crConfig = options[dfConfig.runmode],
        syscpus = process.env.WORKERS || require('os').cpus().length,
        tmpcpus = parseInt(dfConfig.runcpus) || syscpus,
        config = Object.keys(crConfig).reduce(function(set, key, index, arry) {
            set[key] = crConfig[key];
            return set;
        }, dfConfig);

    config.viewRoutesTable = mergeRoute(config.viewRoutesTable);
    config.apiRoutesTable = mergeRoute(config.apiRoutesTable);
    config.homepage = path.join(config.apppath, config.homepage);
    config.loginpage = path.join(config.apppath, config.loginpage);
    config.viewpath = path.join(config.apppath, config.viewpath);
    config.favicon = path.join(config.apppath, config.favicon);
    config.runcpus = tmpcpus > syscpus ? syscpus : tmpcpus;
    config.isCluster = config.runcpus > 1;
    config.log4js.filename = config.log4js.logpath + '/' + config.log4js.logfile;
    config.log4js.logpath = path.join(config.apppath, config.log4js.logpath);
    config.demopath = path.join(config.apppath, '/tests');
    config.routesTable = Array.prototype.concat(config.apiRoutesTable, config.viewRoutesTable);

    return config;
};

/**
 * 中间件注入解析
 * @return {[type]} [description]
 */
var injectorParse = function(app, injector, options) {
    if (injector) {
        if (!Array.isArray(injector)) {
            injector = [injector];
        }
        injector.forEach(function(middleware) {
            app.use(middleware(options));
        });
    }
};

/**
 * 服务器启动参数配置
 * @param  {[type]} app     [description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
var startServer = function(app, options) {
    var serverURL = 'http://' + app.get('host') + ':' + app.get('port');

    switch (options.isCluster) {
        case true:
            if (cluster.isMaster) {
                for (var i = 0; i < options.runcpus - 1; i++) {
                    cluster.fork();
                }
                cluster.on('exit', function(worker) {
                    cluster.fork();
                    app.log4.warn('worker %s died. restart...', worker.process.pid);
                });
            } else if (cluster.isWorker) {
                http.createServer(app).listen(app.get('port'));
            }
            break;
        case false: //单线程运行模式
            app.listen(app.get('port'));
            break;
    }
    if (cluster.isMaster) {
        if (!app.get('production')) {
            app.log4.info('isCluster: ' + options.isCluster);
            app.log4.info('runcpus: ' + options.runcpus);
            app.log4.info('server runat ' + serverURL);
            if (options.openBrowser) {
                options.openBrowser(serverURL);
            }
        }
    }
};

/**
 * 初始化服务设置
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
module.exports.init = function(options, injector) {
    'use strict';

    options = setup(options); //配置环境变量
    injectorParse(app, injector, options); //中间件绑定，即插即用

    //设置环境变量
    app.set('env', options.runmode);
    app.set('favicon', options.favicon);
    app.set('production', options.runmode === 'production');
    app.set('port', process.env.PORT || options.server.port);
    app.set('host', process.env.HOST || options.server.host);
    app.set('views', options.viewpath);
    app.set('view cache', options.viewcache);
    app.set('view engine', options.viewengine);
    app.set('x-powered-by', options.xpoweredby);
    app.set('etag', 'weak');
    app.engine('html', ejs.renderFile);

    //配置中间件
    app.use(favicon(options.favicon));
    //异常提示
    if (options.showerror) {
        app.use(errorHandler());
    }
    //开发和测试环境打印输出请求日志
    if (!app.get('production')) {
        app.use(logger('dev'));
    }
    app.use(methodOverride());

    //配置日志管理器文
    if (!fs.existsSync(options.log4js.logpath)) {
        fs.mkdirSync(options.log4js.logpath);
    }
    log4js.configure({
        appenders: [{
            type: 'console' //控制台输出
        }, {
            type: options.log4js.type, //文件输出
            filename: options.log4js.filename,
            pattern: options.log4js.pattern,
            alwaysIncludePattern: true,
            category: options.log4js.category
        }]
    });
    app.log4 = log4js.getLogger(options.log4js.category);
    app.log4.setLevel(options.log4js.level);

    //请求cookie解析
    app.use(cookieParser());
    //静态资源请求URL解析
    app.use(function(req, res, next) {
        var paths = _.pluck(options.staticpath, "path");
        paths = _.sortBy(paths, function(item) {
            return item.length;
        });
        paths.push(options.staticsroot);
        paths.reverse();
        paths = _.map(paths, function(p) {
            return String.prototype.concat(p.replace(/\/$/, ''), "/");
        });
        paths.forEach(function(path) {
            var match = new RegExp(path, 'i');
            req.url = req.url.replace(match, '');
        });
        req.url = String.prototype.concat("/", req.url.replace(/^\//, ''));
        next();
    });
    //请求对象封装
    app.use(function(req, res, next) {
        req.app = app;
        req.config = options;
        req.homepage = options.homepage;
        req.loginpage = options.loginpage;
        req.authorized = !!req.headers.token || !!req.cookies.token;
        next();
    });

    //设置静态文件路径
    options.staticpath.forEach(function(o, i, a) {
        app.use(express.static(path.join(options.apppath, o.path)));
    });
    //过滤器注册
    app.use(filters.filterRegister(express, options));
    //路由器注册
    app.use(routers.routerRegister(express, options.routesTable));
    //启动服务器
    startServer(app, options);
    //全局异常捕获处理
    process.on('uncaughtException', function(err) {
        app.log4.error((new Date()).toLocaleString() + ' uncaughtException:', err.message);
        app.log4.error(err.stack);
    });
};
