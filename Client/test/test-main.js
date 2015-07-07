/**
 * Author:      changyingwei
 * Create Date: 2015-06-04
 * Description: 配置自动化测试依赖加载项
 */
var allTestFiles = [];
var TEST_REGEXP = /(spec|test)\.js$/i;

//文件路径处理，避免 no timestamp 问题（详情参考：https://github.com/karma-runner/karma-requirejs/issues/6）
for (var file in window.__karma__.files) {
    window.__karma__.files[file.replace(/^\//, '')] = window.__karma__.files[file];
    delete window.__karma__.files[file];
}
//过滤文件，提取测试文件
Object.keys(window.__karma__.files).forEach(function(file) {
    if (TEST_REGEXP.test(file)) {
        allTestFiles.push(file);
    }
});
//配置require
require.config({
    baseUrl: 'base/bower_components',
    // urlArgs: (new Date()).getTime(),
    paths: {
        underscore: 'underscore/underscore',
        jquery: 'jquery/dist/jquery',
        ztreeV3: 'ztree_v3/js/jquery.ztree.all-3.5',
        jqueryUi: 'jquery-ui/ui/jquery-ui',
        bootstrap: 'bootstrap/dist/js/bootstrap',
        datetimepicker: 'smalot-bootstrap-datetimepicker/js/bootstrap-datetimepicker',
        angular: 'angular/angular',
        bindonce: 'angular-bindonce/bindonce',
        ngSortable: 'ng-sortable/dist/ng-sortable',
        angularCookies: 'angular-cookies/angular-cookies',
        angularAnimate: 'angular-animate/angular-animate',
        angularSanitize: 'angular-sanitize/angular-sanitize',
        angularFileUpload: 'angular-file-upload/angular-file-upload',
        scenario: 'angular-scenario/angular-scenario',
        mocks: 'angular-mocks/angular-mocks'
    },
    shim: {
        underscore: {
            exports: '_'
        },
        jquery: {
            exports: '$'
        },
        ztreeV3: {
            deps: ['jquery']
        },
        jqueryUi: {
            deps: ['jquery']
        },
        bootstrap: {
            deps: ['jquery']
        },
        datetimepicker: {
            deps: ['jquery']
        },
        angular: {
            exports: 'angular'
        },
        bindonce: {
            deps: ['angular']
        },
        ngSortable: {
            deps: ['angular']
        },
        angularCookies: {
            deps: ['angular']
        },
        angularAnimate: {
            deps: ['angular']
        },
        angularSanitize: {
            deps: ['angular']
        },
        angularFileUpload: {
            deps: ['angular']
        },
        scenario: {
            deps: ['angular']
        },
        mocks: {
            deps: ['angular']
        }
    },
    deps: Array.prototype.concat([
        'underscore',
        'jquery',
        'ztreeV3',
        'jqueryUi',
        'bootstrap',
        'datetimepicker',
        'angular',
        'bindonce',
        'ngSortable',
        'angularCookies',
        'angularAnimate',
        'angularSanitize',
        'angularFileUpload',
        'scenario',
        'mocks'
    ], allTestFiles),
    callback: window.__karma__.start
});
