## 20200717(2.4.7)
- 添加多网关配置功能
- 添加网关路由ip port模式下配置path的功能

## 20200703(2.4.6)
- 修复strict模式下, tarslog迁移部署的问题
- 修改servant obj编辑时, obj名称不能带数字的问题
- 增加TARS_WEB_SSO_PREFIX环境变量, 识别web和demo的共同前缀, 便于部署, 比如: web->tars.com, demo->sso.tars.com, export TARS_WEB_SSO_PREFIX=sso

## 20200620(2.4.5)
- 合入网关配置功能
- 非管理员用户部署服务时，默认给当前用户添加运维权限

## 20200612(2.4.4)
- 压测功能添加安装压测服务指引
- 优化框架服务异常时压测模块的报错提示
- 解决cookie中身份信息过期时不自动跳转到登录页的BUG

## 20200612(2.4.3)
- 接口测试添加压测功能

## 20200606(2.4.2)
- 添加配置文件时，移除文件名头尾的空格字符
- 部署服务时，判断重复服务逻辑异常修复
- 部署服务成功后，application列表和node列表被清空问题修复
- 发布服务进度弹窗UI换行问题修复

## 20200605(2.4.1)
- 将dcache模块整合到平台代码

## 20200505(2.4.0)
- 接口调试被调服务报错时，返回信息异常问题修复
- 接口调试协议解析，部分默认值解析异常问题修复
- 监控查看按小时筛选功能异常修复
- 监控查看时间顺序排列错误问题修复
- tarsnode_install.sh脚本问题修复
- 自动安装节点显示输出信息
- pingNode超时问题修复
- 与TarsFramework统一版本，改进git工作流

## 20200331(2.1.0)
- 修改token生成的问题, 增加随机数
- 增加删除节点的功能
- 自动发布, 增加阻塞逻辑, 直到有发布结果了才返回
- 发布增加结果显示
- fix db_cache_web.sql, 修复sql语句顺序, 避免外键的错误提示
- logview支持特殊字符的显示
- node check界面增加状态显示

## 20200312(2.0.0)
- querystat & queryproperty 修改为tars服务, 需配合tars-framework(v2.1.0)
- web调用tarsaAdminRegistry采取hash模式, tarsaAdminRegistry可以部署多台
- 管理平台显示 tarsAdminRegistry & tarsregistry (tarsAdminRegistry不能停止)
- 节点管理节点添加检查节点联通的检查(tarsnode->tarsAdminRegistry的联通性)
- 添加清除历史发布包的功能(会删除发布文件)
- 管理平台暴露自动上传和发布接口, 方便测试环境测试服务用, 未来和开发打通, 一键上传和发布(目前已经和2.1.0的tarscpp开发cmake打通)
- 管理平台添加框架检测逻辑
- 服务部署界面, 应用可以选择也可以输入
- 在首页显示web的版本
- 默认开启dcache
- 增加token支持
- 部署时支持node节点选择

## 20200105(1.5.1)
- 修改节点不用ip, 使用域名情况下, tars-node docker拉取tarsnode.tgz的bug
- 修复引用配置文件的bug
- 修复sequelize升级到5.0版本引起的权限bug
- webConf增加一个配置, 使得上传包不验证登录(测试环境开发下需要, 可以自动上传安装包)

## 20200103(1.5.0)
- 增加查看日志的功能： 在服务管理的服务列表下面，点击服务名 即可进入查看该服务日志的界面
- 修复发布历史记录显示不出来的bug
- 修复服务配置中，"PUSH配置文件"不生效的bug
## 20191226(1.4.2)
- tarsnode.tgz获取增加路由路径: http://xxx/files/tarsnode.tgz
## 20191225(1.4.1)
- 修复在docker环境下, 在线安装tarsnode时的bug
- webConf增加host, 安装时替换成本机ip
- 增加/get_tarsnode url, 获取安装tarsnode的脚本

## 20191223(1.4.0)
- 安装时web/files目录下, 存储了框架服务的安装包, 便于框架服务的更新和安装
- 修复自动安装节点的bug
- 安装节点时, 增加判断tarsnode.tgz是否存在
- 增加严格模式(webConf.strict=true or 环境变量TARS_WEB_STRICT=true时生效)
- 严格模式下有以下特性:
>- 框架节点, 不让发布其他业务服务
>- tars的基础服务, 必须有一个节点, 不允许都下线
>- tarslog增加迁移部署功能, 在部署其他服务前, tarslog必须迁移部署在非框架节点上

## 20191216(1.3.1)
- web: 运维管理界面增加tarsnode安装逻辑

## 20191214(1.3.0)
- web: 运维管理界面增加tarsnode列表
- 修复1.2.0的bug

## 20191213(1.2.0)
- 需要升级cpp至1.2.0, protocol至1.2.0, framework至1.2.0
- web: 部署ssl服务, 支持服务绑定域名
- web: 下线时 检查服务active状态
- web: 服务扩容时, 可以绑定域名
- web: 调整发布界面, 操作更易于理解
- web: 服务管理界面增加刷新
- web: 发布错误的提示(跳转到服务管理页面查看)

## 20191128(1.1.1)
- 更新tars-web 支持在tars-web前端挂载nginx

## 20191126(1.0.0)
- 更新tars-web的安装方式, 默认支持权限验证
- 默认创建admin用户, 第一次登陆修改admin密码
- 不允许注册, admin用户来创建用户
- 增加修改密码功能

