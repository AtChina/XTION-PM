>##前端Javascript开发环境搭建说明
* 编辑：韦长英
* 状态：已完成
>
>##设计背景
前端Javascript开发环境搭建包括两个方面：**工程开发环境**、**工程目录职责**
>##规范详细
>###工程开发环境
前端工程使用nodejs做为web容器，此外开发过程还需要用到以下一些插件（注意：安装插件之前必须先安装nodejs），前端开发环境约定如下：
* 操作系统：不限，支持跨平台开发（Windows、Linux、IOS） 
* IDE：使用[Sublime Text](http://www.sublimetext.com/)
* 容器：使用[Node.js](http://www.nodejs.org/)做为Web容器，版本要求：[v0.10.33](http://nodejs.org/dist/v0.10.33/)
* 插件：
[git](http://www.git-scm.com/downloads)：bower安装的很多js、cs、框架大多是托管在[github.com](https://github.com/)上面,安装`git`是为了结合bower使用时自动的下载这些依赖包。参考`git`官方[下载页面](http://www.git-scm.com/downloads)：Windwos下直接下载安装即可。
[bower](http://bower.io/)：自动化安装前端开发过程中需要的js、css等框架，安装命令：`npm install -g bower`
[postman](http://www.getpostman.com/)：RESTful API浏览器调式工具，具体安装过程请参考解决方案目录下的：**【工具】Postman插件安装说明.md**
[ng-inspector](http://ng-inspector.org/)：`ng-inspector`是Chrome和Safari浏览器上专用于开发、调式AngularJS应用的插件，更多信息请看`ng-inspector`官方[源码](https://github.com/rev087/ng-inspector)
[node-inspector](https://github.com/node-inspector/node-inspector)：`node-inspector`插件能够像调式前端JS一样在浏览调式`Nodejs`,方便监控前端调用后端API时传递的参数。安装命令：`npm install -g node-inspector`
* 初始环境：
安装完了nodejs和插件之后，我们需要先从SVN拉取前端项目工程，然后分别在`FRONT-END\Client`和`FRONT-END\Server`目录中执行如下命名完成初始化：
    1. 初始化Client目录：`bower install`
    2. 初始化Server目录：`npm install`
* 启动项目：
工程初始化介绍之后，我们进入Client目录，按住`Shift+右键`，然后选择**在此目录打开命令行**，之后再命令输入命令：`node main.js`就可以启动前端工程了
>
另外，关于**postman**、**ng-inspector**和**node-inspector**具体的使用教程请参考：**【工具】前后端接口联调技巧.md**
>###工程目录职责
>#####Step1：前端工程SVN路径
前端工程SVN路径为：`http://192.168.1.245:9000/svn/企业端/4.系统开发/XTION/DEVELOP/FRONT-END`
>#####Step2：前端工程目录说明
从SVN获取前端工程之后，前端工程目录结构如下：
```SHELL
├─Client
│  ├─app
│  ├─assets
│  │  ├─images
│  │  └─styles
│  ├─bower_components
│  ├─components
│  │  ├─layouts
│  │  └─webparts
│  ├─config
│  ├─data
│  ├─dist
│  ├─logs
│  ├─node_modules
│  ├─tests
│  └─views
└─Server
    ├─lib
    │  ├─controllers
    │  ├─error
    │  ├─filters
    │  └─routes
    ├─node_modules
    └─tests
```
* **目录说明**
    * Client
前端页面逻辑工程目录，放置页面相关的HTML、CSS、JS、IMG、FONT文件等等，其下包含的目录职责如下：
        * app：放置页面相关的全部的JS文件，主要的职责就处理页面逻辑或者行为，跟业务逻辑相关
        * assets：放置静态资源文件
            * images：放置图片文件
            * styles：放置样式文件
        * bower_components：通过bower自动安装的第三方组件和框架
        * components：根据业务需要自定义定制的页面公用组件，比如：下拉框、复合树控件等JS脚本库或者angularjs html指令。
        * config：站点配置文件文件目录，包括站点权限配置文件（`config.yml`）、站点视图路由配置文件（`route.api.yml`）、站点API路由配置文件（`route.view.yml`）
        * data：测试JSON数据
        * dist：部署打包目录
        * logs：前端工程日志日志
        * node_modules：通过npm自动安装的第三方组件和框架
        * tests：测试脚本目录
        * views：前端HTML页面视图
    * Server
Server目录是Web容器，是系统的基础设施，已经封装好了，这里约定不添加任何页面逻辑，如果有需求要修改，请先跟相关架构设计人员沟通：
        * lib：
            * controllers：处理API和VIEW路由请求
            * error：自定义异常处理机制
            * filters：自定义过滤机制
            * routes：读取`route.api.yml`和`route.view.yml`文件，进行动态路由绑定，API路由注册和View路由注册分别由`route.api.yml`和`route.view.yml`两个文件负责。
        * node_modules：通过npm自动安装的第三方组件和框架
        * tests：测试脚本目录
>
>#####Step3：前端工程配置文件
前端工程配置文件目录如下：
```SHELL
├─config
│      config.yml
│      route.api.yml
│      route.view.yml
```
* **配置说明**
    * **config.yml**
`config.yml`是站点配置文件，设置站点的全局属性，在`config.yml`配置文件中通过设置`runmode`可以指定三种运行模式：
        * development模式：
`runmode`设置为`development`模式后，`API`仅调用本地`JSON`文件。
        * test模式：
`runmode`设置为`development`模式后，通过设置`gateway`节点的`port`和`host`，`API`调用实现反向代理请求，可以请求服务器上的`API`也可以请求局域网的`API`，这取决于IP和端口的指向。
        * production模式：
`runmode`设置为`production `模式是针对生产环境的，生产环境使用`nginx`做为负载均衡和反向代理,`API`调用经过`nginx`路由转发到后端多台**API服务器**，同时也会针对视图自动转发到**Node.js Web服务器**，`nginx`具体的路由规则可以查看：**【规范】REST API规范.md**
    * **route.api.yml**
`route.view.yml`前端视图请求路由表，新增的视图页面必须注册路由才能访问，**Node.js Web服务器**读取route.view.yml文件实现路由的动态注册：
        * httpmethod:
视图文件请求的http方法，通常来说都是get，也可以自定义。
        * routepath:
自定义的视图路由请求URI
        * description:
视图描述
        * enableroute:
是否启用该路由，true则启用，false则禁用，禁用状态下 再次请求该路由就返回404错误，在开发环境和生产环境都有效。
        * responetype:
响应类型默认是html,如果设置为file则转为下载模式，浏览器端响应之后弹出文件下载另存为窗口
        * physical_file:
视图文件具体的物理路径。
    * **route.view.yml**
`route.api.yml`文件是前端API请求路由表，后端新增的API前端调用之前必须在这里注册,**Node.js Web服务器**读取route.api.yml文件实现路由的动态注册：
        * httpmethod:
前端调用API之前，首选要注册API到路由表，并且httpmethod一定要符合API文档约定， 不然会出现异常。注意：这仅在开发环境有效，nginx环境下就不做这个设置。
        * routepath:
根据API文档约定的URI，设置路由路径，大小写必须一致。注意：这仅在开发环境有效，nginx环境下就不做这个设置。
        * description:
API接口描述
        * enableroute:
是否启用该路由，true则启用，false则禁用，禁用状态下 再次请求该路由就返回404错误，注意：这仅在开发环境有效，nginx环境下就不做这个设置。
        * responetype:
响应类型默认是json,如果设置为file则转为下载模式，浏览器端响应之后弹出文件下载另存为窗口,注意：这仅在开发环境有效，nginx环境下就不做这个设置。
        * physical_file:
API JSON测试文件路径，这个JSON文件的主要是描述API响应的结果数据JSON格式，注意：这仅在开发环境有效，nginx环境下就不做这个设置。