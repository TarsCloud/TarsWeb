## 20210819(2.4.17)
- 自动更新 t_server_conf 添加 flow_state字段, 为了支持无损发布
- 修复上传发布包名称过于严格的问题
- 修复deleteConfigFile参数的bug
- 不再自动刷新getServerList
- t_server_conf 添加关键字
- 修复db同步的问题, 增加索引
## 20210331(2.4.16)
- 修复部分图片缺失的问题
- 自动刷新服务list和通知信息
- 添加framework版本展示
- 修复语言下拉框遮挡tab的bug
- 修复DCache安装和发布页面type错误
- 修复DCacheRouter Manger Db连接错误
- 修复当服务没启动时, 发布的错误
- 修复dcache router相关表js中定义字段不匹配的错误
- 修改registry_info.js, 添加唯一关键字locator_id
- 日志等级添加TARS
- 修复上传文件没有权限验证的bug
- 增加环境变量 TARS_ENABLE_LOGIN, 控制是否需要登录(优先), 主要给自动测试使用
## 20210105(2.4.15)
- 修复左侧树在含有带set分组服务的情况下显示异常的问题
- 修复调用监控超时率、异常率无法显示的问题
- 修复带set服务查询特性上报异常的问题
- 修复节点配置显示与实际节点不一致的问题
- 优化调用上报/特性上报，当日与对比日为同一天时的查询逻辑
- 调用监控支持多维度分组查询

## 20201111(2.4.14)
- 界面上支持idc分组配置, 在服务编辑里面, 可以设置服务是否启用IDC
- 在运维管理界面, 可以配置IDC分组的信息
- 批量修改服务
- 配置变更显示对比
- dcache路由表配置
- 目录树只显示自己有权限的
- 部署时改成可以批量部署多台服务器


## 20201012(2.4.13)
- inactive 服务没有start当发布服务的时候
- 下载url可以查看到url地址
- 修复tree展示bug, 当开启set模式时
- 扩容界面, 应用服务界面支持filter

## 20200929(2.4.12)
- 修复监控页面小时显示的bug
- 修复服务名称显示的bug 
- 修复registry_timestamp字段更新的bug, 这个比较严重, 会影响tarsregsitry加载db
- 修复添加servant时, 没有返回数据的bug
- 修复logview显示的日志的bug, 中文能正常显示了

## 20200918(2.4.11)
- 修复连接数据库, 时区不是整点时区的bug
- 修复服务监控(set模式)树显示的bug
- 修复dcache覆盖安装时下拉列表只读时还能点击的问题
- 修复dcache mk server(不带db)的发布问题
- 修改dcache树数据显示BUG
- 创建dcache应用做个保护，不能取名web
- config 历史默认显示10条数据
- config 配置按照时间倒序排序
- dcache迁移时可以修改内存大小

## 20200902(2.4.10)
- fix dcache 部署不带db的cache的bug
- 修复ret[0]为0时，平均耗时/异常率/超时率不出图的bug
- 修复addTask, 鉴权的bug
- 修复db_cache_web.sql sql的bug

## 20200819(2.4.9)
- web上支持给tarsnode打标签(未来可能有其他用途)
- 支持发布包下载
- tarsnode批量升级功能
- 优化服务配置界面样式
- web全面支持多tab, 保留tab状态
- dcache支持独立升级安装dbaccess/backup/mirror
- 登录支持验证码
- 首页支持搜索逻辑
- 修复权限的bug, 给开发用户更大权限
- 修复数据库同步的bug
- 修复监控图标的bug

## 20200805(2.4.8)
- 更新dcache图标
- 修复创建表, 未使用指定字符集的bug
- 支持LDAP鉴权登录
- 支持开启所有用户都为admin用户(测试环境佳使用)
- 增加update.js, 为db升级时使用
- /api/upload_patch_package 返回json
- 更新webConf, 字符集改为uft8(其实最好是utf8mb4, 但是历史不太好兼容了)
- 修改dcache 查看property数据的bug
- 修改查看配置, 排版溢出的bug
- 修改dcache proxy/router 缺省的模板
- 启用db sync的功能, 并修复bug
- 修改压测的页面展示bug
- 修改接口测试, 解析枚举类型的bug
- 支持多tab, 方便操作

## 20200718(2.4.7)
- 添加多网关配置功能
- 添加网关路由ip port模式下配置path的功能
- 完善dcache的支持, 全面支持dcache, 包括router, cache, router, dbaccess的自动部署
- 合并demo到web下, 不再开启两个端口
- 支持tars树的业务关系配置
- 支持tarsgo的优雅发布

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

