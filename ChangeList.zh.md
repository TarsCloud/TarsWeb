## 20211115(2.4.21)
- 添加k8s events查看.
- node节点管理支持批量编辑普通标签与亲和性标签
- 添加tars.es模板,notify,events es从模板读取
- k8s 支持维护normal服务
- 添加节点详情
`
## 20211115(2.4.20)

- 卸载服务时删除配置文件
- 更新 AdminReg.tars, 修复无损发布的问题
- 修复 k8s 版本卸载服务时, 服务列表显示不全的 bug
- 修复接口调试的 bug
- 修复添加 token 的 bug
- 修复服务日志页面无法打开的 bug

## 20211018(2.4.19)

- 修复节点页面不显示的问题
- 完善调用链的支持, 打开 tab, 需要 framework >= 3.0.1

## 20210909(2.4.18)

- 调整目录结构, 支持 k8s, 默认没打开
- 增加了调用链的界面(需要配合 framework 升级, 增加调用链服务), 未打开
- 增加了无损发布接口
- 接口测试的返回值 json 格式化
- 修复读取配置文件 list 的 bug
- 去掉 package.json 中的 pm2
- 密码登录增加 sha1, 修复密码没有加密的 bug
- 调用 k8s 的 tarsimage 增加超时时间
- 修复 tab 名称显示不完全的问题
- 修复部署界面中的 bug
- db_user_system 添加 t_setting 表

## 20210819(2.4.17)

- 自动更新 t_server_conf 添加 flow_state 字段, 为了支持无损发布
- 修复上传发布包名称过于严格的问题
- 修复 deleteConfigFile 参数的 bug
- 不再自动刷新 getServerList
- t_server_conf 添加关键字
- 修复 db 同步的问题, 增加索引

## 20210331(2.4.16)

- 修复部分图片缺失的问题
- 自动刷新服务 list 和通知信息
- 添加 framework 版本展示
- 修复语言下拉框遮挡 tab 的 bug
- 修复 DCache 安装和发布页面 type 错误
- 修复 DCacheRouter Manger Db 连接错误
- 修复当服务没启动时, 发布的错误
- 修复 dcache router 相关表 js 中定义字段不匹配的错误
- 修改 registry_info.js, 添加唯一关键字 locator_id
- 日志等级添加 TARS
- 修复上传文件没有权限验证的 bug
- 增加环境变量 TARS_ENABLE_LOGIN, 控制是否需要登录(优先), 主要给自动测试使用

## 20210105(2.4.15)

- 修复左侧树在含有带 set 分组服务的情况下显示异常的问题
- 修复调用监控超时率、异常率无法显示的问题
- 修复带 set 服务查询特性上报异常的问题
- 修复节点配置显示与实际节点不一致的问题
- 优化调用上报/特性上报，当日与对比日为同一天时的查询逻辑
- 调用监控支持多维度分组查询

## 20201111(2.4.14)

- 界面上支持 idc 分组配置, 在服务编辑里面, 可以设置服务是否启用 IDC
- 在运维管理界面, 可以配置 IDC 分组的信息
- 批量修改服务
- 配置变更显示对比
- dcache 路由表配置
- 目录树只显示自己有权限的
- 部署时改成可以批量部署多台服务器

## 20201012(2.4.13)

- inactive 服务没有 start 当发布服务的时候
- 下载 url 可以查看到 url 地址
- 修复 tree 展示 bug, 当开启 set 模式时
- 扩容界面, 应用服务界面支持 filter

## 20200929(2.4.12)

- 修复监控页面小时显示的 bug
- 修复服务名称显示的 bug
- 修复 registry_timestamp 字段更新的 bug, 这个比较严重, 会影响 tarsregsitry 加载 db
- 修复添加 servant 时, 没有返回数据的 bug
- 修复 logview 显示的日志的 bug, 中文能正常显示了

## 20200918(2.4.11)

- 修复连接数据库, 时区不是整点时区的 bug
- 修复服务监控(set 模式)树显示的 bug
- 修复 dcache 覆盖安装时下拉列表只读时还能点击的问题
- 修复 dcache mk server(不带 db)的发布问题
- 修改 dcache 树数据显示 BUG
- 创建 dcache 应用做个保护，不能取名 web
- config 历史默认显示 10 条数据
- config 配置按照时间倒序排序
- dcache 迁移时可以修改内存大小

## 20200902(2.4.10)

- fix dcache 部署不带 db 的 cache 的 bug
- 修复 ret[0]为 0 时，平均耗时/异常率/超时率不出图的 bug
- 修复 addTask, 鉴权的 bug
- 修复 db_cache_web.sql sql 的 bug

## 20200819(2.4.9)

- web 上支持给 tarsnode 打标签(未来可能有其他用途)
- 支持发布包下载
- tarsnode 批量升级功能
- 优化服务配置界面样式
- web 全面支持多 tab, 保留 tab 状态
- dcache 支持独立升级安装 dbaccess/backup/mirror
- 登录支持验证码
- 首页支持搜索逻辑
- 修复权限的 bug, 给开发用户更大权限
- 修复数据库同步的 bug
- 修复监控图标的 bug

## 20200805(2.4.8)

- 更新 dcache 图标
- 修复创建表, 未使用指定字符集的 bug
- 支持 LDAP 鉴权登录
- 支持开启所有用户都为 admin 用户(测试环境佳使用)
- 增加 update.js, 为 db 升级时使用
- /api/upload_patch_package 返回 json
- 更新 webConf, 字符集改为 uft8(其实最好是 utf8mb4, 但是历史不太好兼容了)
- 修改 dcache 查看 property 数据的 bug
- 修改查看配置, 排版溢出的 bug
- 修改 dcache proxy/router 缺省的模板
- 启用 db sync 的功能, 并修复 bug
- 修改压测的页面展示 bug
- 修改接口测试, 解析枚举类型的 bug
- 支持多 tab, 方便操作

## 20200718(2.4.7)

- 添加多网关配置功能
- 添加网关路由 ip port 模式下配置 path 的功能
- 完善 dcache 的支持, 全面支持 dcache, 包括 router, cache, router, dbaccess 的自动部署
- 合并 demo 到 web 下, 不再开启两个端口
- 支持 tars 树的业务关系配置
- 支持 tarsgo 的优雅发布

## 20200703(2.4.6)

- 修复 strict 模式下, tarslog 迁移部署的问题
- 修改 servant obj 编辑时, obj 名称不能带数字的问题
- 增加 TARS_WEB_SSO_PREFIX 环境变量, 识别 web 和 demo 的共同前缀, 便于部署, 比如: web->tars.com, demo->sso.tars.com, export TARS_WEB_SSO_PREFIX=sso

## 20200620(2.4.5)

- 合入网关配置功能
- 非管理员用户部署服务时，默认给当前用户添加运维权限

## 20200612(2.4.4)

- 压测功能添加安装压测服务指引
- 优化框架服务异常时压测模块的报错提示
- 解决 cookie 中身份信息过期时不自动跳转到登录页的 BUG

## 20200612(2.4.3)

- 接口测试添加压测功能

## 20200606(2.4.2)

- 添加配置文件时，移除文件名头尾的空格字符
- 部署服务时，判断重复服务逻辑异常修复
- 部署服务成功后，application 列表和 node 列表被清空问题修复
- 发布服务进度弹窗 UI 换行问题修复

## 20200605(2.4.1)

- 将 dcache 模块整合到平台代码

## 20200505(2.4.0)

- 接口调试被调服务报错时，返回信息异常问题修复
- 接口调试协议解析，部分默认值解析异常问题修复
- 监控查看按小时筛选功能异常修复
- 监控查看时间顺序排列错误问题修复
- tarsnode_install.sh 脚本问题修复
- 自动安装节点显示输出信息
- pingNode 超时问题修复
- 与 TarsFramework 统一版本，改进 git 工作流

## 20200331(2.1.0)

- 修改 token 生成的问题, 增加随机数
- 增加删除节点的功能
- 自动发布, 增加阻塞逻辑, 直到有发布结果了才返回
- 发布增加结果显示
- fix db_cache_web.sql, 修复 sql 语句顺序, 避免外键的错误提示
- logview 支持特殊字符的显示
- node check 界面增加状态显示

## 20200312(2.0.0)

- querystat & queryproperty 修改为 tars 服务, 需配合 tars-framework(v2.1.0)
- web 调用 tarsaAdminRegistry 采取 hash 模式, tarsaAdminRegistry 可以部署多台
- 管理平台显示 tarsAdminRegistry & tarsregistry (tarsAdminRegistry 不能停止)
- 节点管理节点添加检查节点联通的检查(tarsnode->tarsAdminRegistry 的联通性)
- 添加清除历史发布包的功能(会删除发布文件)
- 管理平台暴露自动上传和发布接口, 方便测试环境测试服务用, 未来和开发打通, 一键上传和发布(目前已经和 2.1.0 的 tarscpp 开发 cmake 打通)
- 管理平台添加框架检测逻辑
- 服务部署界面, 应用可以选择也可以输入
- 在首页显示 web 的版本
- 默认开启 dcache
- 增加 token 支持
- 部署时支持 node 节点选择

## 20200105(1.5.1)

- 修改节点不用 ip, 使用域名情况下, tars-node docker 拉取 tarsnode.tgz 的 bug
- 修复引用配置文件的 bug
- 修复 sequelize 升级到 5.0 版本引起的权限 bug
- webConf 增加一个配置, 使得上传包不验证登录(测试环境开发下需要, 可以自动上传安装包)

## 20200103(1.5.0)

- 增加查看日志的功能： 在服务管理的服务列表下面，点击服务名 即可进入查看该服务日志的界面
- 修复发布历史记录显示不出来的 bug
- 修复服务配置中，"PUSH 配置文件"不生效的 bug

## 20191226(1.4.2)

- tarsnode.tgz 获取增加路由路径: http://xxx/files/tarsnode.tgz

## 20191225(1.4.1)

- 修复在 docker 环境下, 在线安装 tarsnode 时的 bug
- webConf 增加 host, 安装时替换成本机 ip
- 增加/get_tarsnode url, 获取安装 tarsnode 的脚本

## 20191223(1.4.0)

- 安装时 web/files 目录下, 存储了框架服务的安装包, 便于框架服务的更新和安装
- 修复自动安装节点的 bug
- 安装节点时, 增加判断 tarsnode.tgz 是否存在
- 增加严格模式(webConf.strict=true or 环境变量 TARS_WEB_STRICT=true 时生效)
- 严格模式下有以下特性:
  > - 框架节点, 不让发布其他业务服务
  > - tars 的基础服务, 必须有一个节点, 不允许都下线
  > - tarslog 增加迁移部署功能, 在部署其他服务前, tarslog 必须迁移部署在非框架节点上

## 20191216(1.3.1)

- web: 运维管理界面增加 tarsnode 安装逻辑

## 20191214(1.3.0)

- web: 运维管理界面增加 tarsnode 列表
- 修复 1.2.0 的 bug

## 20191213(1.2.0)

- 需要升级 cpp 至 1.2.0, protocol 至 1.2.0, framework 至 1.2.0
- web: 部署 ssl 服务, 支持服务绑定域名
- web: 下线时 检查服务 active 状态
- web: 服务扩容时, 可以绑定域名
- web: 调整发布界面, 操作更易于理解
- web: 服务管理界面增加刷新
- web: 发布错误的提示(跳转到服务管理页面查看)

## 20191128(1.1.1)

- 更新 tars-web 支持在 tars-web 前端挂载 nginx

## 20191126(1.0.0)

- 更新 tars-web 的安装方式, 默认支持权限验证
- 默认创建 admin 用户, 第一次登陆修改 admin 密码
- 不允许注册, admin 用户来创建用户
- 增加修改密码功能
