/**
 * Author:      changyingwei
 * Create Date: 2015-03-24
 * Description: 前端工作流配置入口
 */
module.exports = function() {
    'use strict';

    return {
        help: require('./task.help'), //命令行帮助提示
        doc: require('./task.doc'), //前端文档命令
        test: require('./task.test'), //前端测试命令
        init: require('./task.init'), //前端工程初始化
        build: require('./task.build'), //系统编译输出静态资源
        deploy: require('./task.deploy'), //前端工程部署命令
        publish: require('./task.publish'), //前端工程打包命令
        default: require('./task.default') //默认命令
    };
};
