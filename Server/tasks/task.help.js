/**
 * Author:      changyingwei
 * Create Date: 2015-03-24
 * Description: 前端工作流帮助文档
 */
module.exports = function() {
    'use strict';

    var util = require('util');

    process.stdout.write(util.format('\x1b[36m%s', 'Usage\n\n'));
    process.stdout.write(util.format('\x1b[33m%s', '  node main.js  [help] [test] [init] [build] [deploy] [publish] [default]\n\n'));
    process.stdout.write(util.format('\x1b[36m%s', 'The most commonly available tasks are:\n\n'));
    process.stdout.write(util.format('\x1b[32m%s', '  node main.js help:    '));
    process.stdout.write(util.format('\x1b[37m%s', 'get all task info\n\n'));
    process.stdout.write(util.format('\x1b[32m%s', '  node main.js doc:     '));
    process.stdout.write(util.format('\x1b[37m%s', 'get front-end framework doc\n\n'));
    process.stdout.write(util.format('\x1b[32m%s', '  node main.js test:    '));
    process.stdout.write(util.format('\x1b[37m%s', 'run front-end auto test\n\n'));
    process.stdout.write(util.format('\x1b[32m%s', '  node main.js init:    '));
    process.stdout.write(util.format('\x1b[37m%s', 'auto exec bower install and npm install\n\n'));
    process.stdout.write(util.format('\x1b[32m%s', '  node main.js build:   '));
    process.stdout.write(util.format('\x1b[37m%s', 'auto build less, combine compress js and images\n\n'));
    process.stdout.write(util.format('\x1b[32m%s', '  node main.js deploy:  '));
    process.stdout.write(util.format('\x1b[37m%s', 'auto exec publish task then deploy to remote server\n\n'));
    process.stdout.write(util.format('\x1b[32m%s', '  node main.js publish: '));
    process.stdout.write(util.format('\x1b[37m%s', 'auto package and compress file to zip\n\n'));
    process.stdout.write(util.format('\x1b[32m%s', '  node main.js default: '));
    process.stdout.write(util.format('\x1b[37m%s', 'default task that start web server,you can do this with '));
    process.stdout.write(util.format('\x1b[32m%s', 'node main.js\n\n'));
    process.stdout.write(util.format('\x1b[36m%s', 'There are some demo url that can help you quickly develop web app:\n\n'));
    process.stdout.write(util.format('\x1b[32m%s', '  http://localhost:8083/demo/ :                  '));
    process.stdout.write(util.format('\x1b[37m%s', 'front-end demo page in ./Client/tests/demo/ directory\n\n'));
    process.stdout.write(util.format('\x1b[32m%s', '  http://localhost:8083/*/*.html:                '));
    process.stdout.write(util.format('\x1b[37m%s', 'front-end test page in ./Client/tests/ directory \n\n'));
    process.stdout.write(util.format('\x1b[32m%s', '  http://localhost:8083/layoutit/index.html :    '));
    process.stdout.write(util.format('\x1b[37m%s', 'xtion paas platform demo\n\n'));
};
