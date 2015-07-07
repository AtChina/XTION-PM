/**
 * Author:      changyingwei
 * Create Date: 2015-05-18  
 * Description: 对前端工程Client目录中的文件进行合并和压缩，优化前端性能
 */
module.exports = function(callback) {
    'use strict';

    var Q = require('q'),
        fs = require('fs'),
        del = require('del'),
        gulp = require('gulp'),
        util = require('util'),
        wrap = require("gulp-wrap"),
        concat = require('gulp-concat'),
        colors = require('colors/safe'),
        rjs = require('gulp-requirejs'),
        uglify = require('gulp-uglify'),
        header = require('gulp-header'),
        footer = require('gulp-footer'),
        rename = require("gulp-rename"),
        requirejs = require('requirejs'),
        replace = require('gulp-replace'),
        imagemin = require('gulp-imagemin'),
        ngHtml2Js = require('gulp-ng-html2js'),
        minifyCss = require('gulp-minify-css'),
        pngquant = require('imagemin-pngquant'),
        sourcemaps = require('gulp-sourcemaps'),
        minifyHtml = require('gulp-minify-html'),
        removeLines = require('gulp-remove-lines');

    Q.fcall(function() { //第一步:生成dist目录，然后移动前端文件
        var deferred = Q.defer();
        process.stdout.write(util.format('\x1b[36m%s', '\nFRONT-END AUTO WORKFLOW STEPS:\n\n'));
        process.stdout.write(util.format('\x1b[37m%s', '1)'));
        process.stdout.write(util.format('\x1b[33m%s\x1b[0m', ' cleaning dist directory...'));
        del(['dist'], function() {
            process.stdout.write(util.format('\x1b[32m%s\x1b[0m', '  successful!\n\n'));
            process.stdout.write(util.format('\x1b[37m%s', '2)'));
            process.stdout.write(util.format('\x1b[33m%s\x1b[0m', ' copy client directory to dist directory...'));
            gulp.src(['./**', '!dist/**', '!zipfiles/**', '!docs/**', '!test/**', '!logs/**', '!bower.json', '!README.md', '!bower_components'])
                .pipe(gulp.dest('dist/FRONT-END/Client'))
                .on('finish', function() {
                    del([
                        'dist/FRONT-END/Client/app/directives/ngui.templates.directive.js',
                        'dist/FRONT-END/Client/assets/images',
                        'dist/FRONT-END/Client/assets/styles',
                        'dist/FRONT-END/Client/zipfiles',
                        'dist/FRONT-END/Client/views',
                        'dist/FRONT-END/Client/docs',
                        'dist/FRONT-END/Client/test',
                        'dist/FRONT-END/Client/logs'
                    ], function() {
                        process.stdout.write(util.format('\x1b[32m%s\x1b[0m', '  successful!\n\n'));
                        deferred.resolve(true);
                    });
                })
                .on('error', function(error) {
                    process.stdout.write(util.format('\x1b[31m%s\x1b[0m', '  failed!\n\n'));
                    deferred.reject(new Error(error));
                });
        });
        return deferred.promise;
    }).then(function(success) { //第二步:将html文件转为js文件
        if (success) {
            var deferred = Q.defer();
            process.stdout.write(util.format('\x1b[37m%s', '3)'));
            process.stdout.write(util.format('\x1b[33m%s\x1b[0m', ' transform html templates file to js templates file...'));
            gulp.src(["./components/**/*.tpl.html", '!components/webparts/com-template/login-form.tpl.html'])
                .pipe(minifyHtml({
                    empty: true,
                    spare: true,
                    quotes: true
                }))
                .pipe(ngHtml2Js({
                    moduleName: "ngui.templates",
                    template: "     $templateCache.put('<%= template.url %>','<%= template.escapedContent %>');",
                    rename: function(templateUrl, templateFile) {
                        return templateUrl.replace('webparts/com-template', '')
                            .replace('webparts/ngui-template', '')
                            .replace('webparts/xtion-template', '');
                    }
                }))
                .pipe(gulp.dest("./dist/FRONT-END/Client/components"))
                .on('finish', function() {
                    process.stdout.write(util.format('\x1b[32m%s\x1b[0m', '  successful!\n\n'));
                    deferred.resolve(true);
                })
                .on('error', function(error) {
                    process.stdout.write(util.format('\x1b[31m%s\x1b[0m', '  failed!\n\n'));
                    deferred.reject(new Error(error));
                });
            return deferred.promise;
        }
    }).then(function(success) { //第三步:合并和压缩html模板脚步文件
        if (success) {
            var deferred = Q.defer();
            process.stdout.write(util.format('\x1b[37m%s', '4)'));
            process.stdout.write(util.format('\x1b[33m%s\x1b[0m', ' combine and compress js templates file...'));
            gulp.src('./dist/FRONT-END/Client/components/**/*.js')
                .pipe(concat('ngui.templates.directive.js'))
                .pipe(gulp.dest('./dist/FRONT-END/Client/components'))
                .on('finish', function() {
                    process.stdout.write(util.format('\x1b[32m%s\x1b[0m', '  successful!\n\n'));
                    deferred.resolve(true);
                })
                .on('error', function(error) {
                    process.stdout.write(util.format('\x1b[31m%s\x1b[0m', '  failed!\n\n'));
                    deferred.reject(new Error(error));
                });
            return deferred.promise;
        }
    }).then(function(success) { //第四步:给ngui.templates.directive.js文件添加头尾
        if (success) {
            var deferred = Q.defer();
            process.stdout.write(util.format('\x1b[37m%s', '5)'));
            process.stdout.write(util.format('\x1b[33m%s\x1b[0m', ' add header and footer to ngui.templates.directive.js file...'));
            gulp.src('./dist/FRONT-END/Client/components/ngui.templates.directive.js')
                .pipe(header("define([], function() {\n" +
                    "   'use strict';\n" +
                    "   var templates = angular.module('ngui.templates', []);\n" +
                    "   templates.run(['$templateCache', function($templateCache) {\n"
                ))
                .pipe(footer("  }]);\n" +
                    "   return templates;\n" +
                    "});\n"
                ))
                .pipe(gulp.dest('./dist/FRONT-END/Client/app/directives'))
                .on('finish', function() {
                    del([
                        'dist/FRONT-END/Client/components/ngui.templates.directive.js',
                        'dist/FRONT-END/Client/components/webparts'
                    ], function() {
                        process.stdout.write(util.format('\x1b[32m%s\x1b[0m', '  successful!\n\n'));
                        deferred.resolve(true);
                    });
                })
                .on('error', function(error) {
                    process.stdout.write(util.format('\x1b[31m%s\x1b[0m', '  failed!\n\n'));
                    deferred.reject(new Error(error));
                });
            return deferred.promise;
        }
    }).then(function(success) { //第五步:合并和压缩app目录下的脚步文件
        if (success) {
            var deferred = Q.defer();
            process.stdout.write(util.format('\x1b[37m%s', '6)'));
            process.stdout.write(util.format('\x1b[33m%s\x1b[0m', ' combine and compress js files in app directory...'));
            rjs({
                    baseUrl: process.cwd() + "/dist/FRONT-END/Client/app",
                    name: "app",
                    out: "app.min.js"
                })
                .pipe(uglify())
                .pipe(gulp.dest(process.cwd() + "/dist/FRONT-END/Client/app"));
            process.stdout.write(util.format('\x1b[32m%s\x1b[0m', '  successful!\n\n'));
            return true; //rjs插件pipe之后，没有封装数据流的finish和error事件，所以这里需要手动返回true
        }
    }).then(function(success) { //第六步:清除app目录下的脚步员文件，重命名app.min.js
        if (success) {
            var deferred = Q.defer();
            process.stdout.write(util.format('\x1b[37m%s', '7)'));
            process.stdout.write(util.format('\x1b[33m%s\x1b[0m', ' rename app.min.js to app.js...'));
            del([
                'dist/FRONT-END/Client/app/controllers',
                'dist/FRONT-END/Client/app/directives',
                'dist/FRONT-END/Client/app/filters',
                'dist/FRONT-END/Client/app/models',
                'dist/FRONT-END/Client/app/services',
                'dist/FRONT-END/Client/app/app.js'
            ], function() {
                gulp.src("./dist/FRONT-END/Client/app/app.min.js")
                    .pipe(rename("app.js"))
                    .pipe(gulp.dest("./dist/FRONT-END/Client/app/"))
                    .on('finish', function() {
                        del(['dist/FRONT-END/Client/app/app.min.js'], function() {
                            process.stdout.write(util.format('\x1b[32m%s\x1b[0m', '  successful!\n\n'));
                            deferred.resolve(true);
                        });
                    })
                    .on('error', function(error) {
                        process.stdout.write(util.format('\x1b[31m%s\x1b[0m', '  failed!\n\n'));
                        deferred.reject(new Error(error));
                    });
            });
            return deferred.promise;
        }
    }).then(function(data) { //第七步:压缩assets/script目录下的脚本文件
        if (data) {
            var deferred = Q.defer();
            process.stdout.write(util.format('\x1b[37m%s', '8)'));
            process.stdout.write(util.format('\x1b[33m%s\x1b[0m', ' compress js files in assets/script directory ...'));
            del(['dist/FRONT-END/Client/assets/script/**/*.js'], function() {
                gulp.src('assets/script/**/*.js')
                    .pipe(uglify())
                    .pipe(gulp.dest('dist/FRONT-END/Client/assets/script'))
                    .on('finish', function() {
                        process.stdout.write(util.format('\x1b[32m%s\x1b[0m', '  successful!\n\n'));
                        deferred.resolve(true);
                    })
                    .on('error', function(error) {
                        process.stdout.write(util.format('\x1b[31m%s\x1b[0m', '  failed!\n\n'));
                        deferred.reject(new Error(error));
                    });
            });
            return deferred.promise;
        }
    }).then(function(success) { //第八步:优化登陆页面和脚本
        if (success) {
            var deferred = Q.defer();
            process.stdout.write(util.format('\x1b[37m%s', '9)'));
            process.stdout.write(util.format('\x1b[33m%s\x1b[0m', ' optimization login page js and html...'));
            del(['dist/FRONT-END/Client/assets/script/_login.js'], function() {
                gulp.src(['components/webparts/com-template/login-form.tpl.html'])
                    .pipe(minifyHtml({
                        empty: true,
                        spare: true,
                        quotes: true
                    }))
                    .pipe(ngHtml2Js({
                        moduleName: "Login",
                        template: "angular.module('<%= moduleName %>').run(['$templateCache', function($templateCache) {\n" +
                            "  $templateCache.put('<%= template.url %>',\n    '<%= template.escapedContent %>');\n" +
                            "}]);\n",
                        rename: function(templateUrl, templateFile) {
                            return "/" + templateUrl;
                        }
                    }))
                    .pipe(gulp.dest("./dist/FRONT-END/Client/assets/script"))
                    .on('finish', function() {
                        process.stdout.write(util.format('\x1b[32m%s\x1b[0m', '  successful!\n\n'));
                        fs.readFile("./dist/FRONT-END/Client/assets/script/login-form.tpl.js", {
                            encoding: 'utf8'
                        }, function(err, data) {
                            if (err) {
                                deferred.reject(new Error(err));
                            } else {
                                deferred.resolve(data);
                            }
                        });
                    })
                    .on('error', function(error) {
                        process.stdout.write(util.format('\x1b[31m%s\x1b[0m', '  failed!\n\n'));
                        deferred.reject(new Error(error));
                    });
            });
            return deferred.promise;
        }
    }).then(function(data) { //第九步:合并和压缩登录页面
        if (data) {
            var deferred = Q.defer();
            process.stdout.write(util.format('\x1b[37m%s', '10)'));
            process.stdout.write(util.format('\x1b[33m%s\x1b[0m', ' combine and compress login page html and js...'));
            gulp.src('assets/script/_login.js')
                .pipe(replace(/\/\/REPLACE\:TEMPLATE/g, data))
                .pipe(uglify())
                .pipe(gulp.dest('dist/FRONT-END/Client/assets/script'))
                .on('finish', function() {
                    del(['dist/FRONT-END/Client/assets/script/login-form.tpl.js'], function() {
                        process.stdout.write(util.format('\x1b[32m%s\x1b[0m', '  successful!\n\n'));
                        deferred.resolve(true);
                    });
                })
                .on('error', function(error) {
                    process.stdout.write(util.format('\x1b[31m%s\x1b[0m', '  failed!\n\n'));
                    deferred.reject(new Error(error));
                });
            return deferred.promise;
        }
    }).then(function(success) { //第九步:压缩views目录中html文件
        if (success) {
            var deferred = Q.defer();
            process.stdout.write(util.format('\x1b[37m%s', '11)'));
            process.stdout.write(util.format('\x1b[33m%s\x1b[0m', ' compress views directory html files...'));
            gulp.src('./views/**/*.html')
                .pipe(minifyHtml({
                    empty: true,
                    spare: true,
                    quotes: true,
                    loose: true
                }))
                .pipe(gulp.dest('dist/FRONT-END/Client/views'))
                .on('finish', function() {
                    process.stdout.write(util.format('\x1b[32m%s\x1b[0m', '  successful!\n\n'));
                    deferred.resolve(true);
                })
                .on('error', function(error) {
                    process.stdout.write(util.format('\x1b[31m%s\x1b[0m', '  failed!\n\n'));
                    deferred.reject(new Error(error));
                });
            return deferred.promise;
        }
    }).then(function(success) { //第十步:编译、合并和压缩CSS文件
        if (success) {
            var deferred = Q.defer();
            process.stdout.write(util.format('\x1b[37m%s', '12)'));
            process.stdout.write(util.format('\x1b[33m%s\x1b[0m', ' compile then combine and compress css style files...'));
            Q.fcall(function() { //压缩主页CSS
                    requirejs.optimize({
                        optimizeCss: "standard",
                        cssIn: "assets/styles/_index.min.css",
                        out: "dist/FRONT-END/Client/assets/styles/_index.min.css"
                    }, function(buildResponse) {
                        deferred.resolve(true);
                    }, function(err) {
                        deferred.reject(new Error(err));
                    });
                    return deferred.promise;
                }).then(function(success) { //压缩登录页CSS
                    if (success) {
                        requirejs.optimize({
                            optimizeCss: "standard",
                            cssIn: "assets/styles/_login.min.css",
                            out: "dist/FRONT-END/Client/assets/styles/_login.min.css"
                        }, function(buildResponse) {
                            deferred.resolve(true);
                        }, function(err) {
                            deferred.reject(new Error(err));
                        });
                        return deferred.promise;
                    }
                }).catch(function(error) {
                    process.stdout.write(util.format('\x1b[31m%s\x1b[0m', '  failed!\n\n'));
                    console.log(colors.red.bold(error.message));
                })
                .finally(function(success) {
                    deferred.resolve(true);
                }).done();
            return deferred.promise;
        }
    }).then(function(success) { //第十一步:压缩图标文件
        if (success) {
            var deferred = Q.defer();
            process.stdout.write(util.format('\x1b[32m%s\x1b[0m', '  successful!\n\n'));
            process.stdout.write(util.format('\x1b[37m%s', '13)'));
            process.stdout.write(util.format('\x1b[33m%s\x1b[0m', ' compress images files...\n    '));
            gulp.src('assets/images/**/*.{gif,jpg,png,svg}')
                .pipe(imagemin({
                    optimizationLevel: 7,
                    progressive: true,
                    interlaced: true,
                    multipass: true,
                    // verbose: true,
                    svgoPlugins: [{
                        removeViewBox: false
                    }],
                    use: [pngquant()]
                }))
                .pipe(gulp.dest('dist/FRONT-END/Client/assets/images'))
                .on('finish', function() {
                    process.stdout.write(util.format('\x1b[32m%s\x1b[0m', '    successful!\n\n'));
                    deferred.resolve(true);
                })
                .on('error', function(error) {
                    process.stdout.write(util.format('\x1b[31m%s\x1b[0m', '  failed!\n\n'));
                    deferred.reject(new Error(error));
                });
            return deferred.promise;
        }
    }).then(function(success) { //第十二步:移除bower_components目录下的*.js文件中的sourceMappingURL注释
        if (success) {
            var deferred = Q.defer();
            process.stdout.write(util.format('\x1b[37m%s', '14)'));
            process.stdout.write(util.format('\x1b[33m%s\x1b[0m', ' remove sourceMappingURL comment lines from *.min.js in bower_components directory...'));
            gulp.src('bower_components/**/*.js')
                .pipe(removeLines({
                    'filters': [
                        /\/\/\# sourceMappingURL\=/
                    ]
                }))
                .pipe(gulp.dest('dist/FRONT-END/Client/bower_components'))
                .on('finish', function() {
                    process.stdout.write(util.format('\x1b[32m%s\x1b[0m', '    successful!\n\n'));
                    deferred.resolve(true);
                })
                .on('error', function(error) {
                    process.stdout.write(util.format('\x1b[31m%s\x1b[0m', '  failed!\n\n'));
                    deferred.reject(new Error(error));
                });
            return deferred.promise;
        }
    }).then(function(success) { //第十三步:压缩require.js源代码
        if (success) {
            var deferred = Q.defer();
            process.stdout.write(util.format('\x1b[37m%s', '15)'));
            process.stdout.write(util.format('\x1b[33m%s\x1b[0m', ' compress require.js source code...'));
            del(["dist/FRONT-END/Client/bower_components/requirejs"], function() {
                gulp.src('bower_components/requirejs/require.js')
                    .pipe(uglify())
                    .pipe(gulp.dest(process.cwd() + "/dist/FRONT-END/Client/bower_components/requirejs"))
                    .on('finish', function() {
                        process.stdout.write(util.format('\x1b[32m%s\x1b[0m', '    successful!\n\n'));
                        deferred.resolve(true);
                    })
                    .on('error', function(error) {
                        process.stdout.write(util.format('\x1b[31m%s\x1b[0m', '  failed!\n\n'));
                        deferred.reject(new Error(error));
                    });
            });
            return deferred.promise;
        }
    }).catch(function(error) {
        process.stdout.write(util.format('\x1b[31m%s\x1b[0m', '  failed!\n\n'));
        console.log(colors.red.bold(error.message)); //处理错误
    }).finally(function(success) {
        if (callback) {
            callback(success);
        }
    }).done();
};
