## TARS 用户体系模块使用指引
TARS管理平台提供了与用户体系（包括单点登录系统和权限系统）对接的能力，若用户本身无相应的系统，TARS可提供了一个简易的用户体系模块，供用户选装。用户体系模块提供了单点登录和注册的功能，以及到服务层级的权限控制能力。用户也可以选择只使用其中一个功能。
#### 一、默认用户体系模块安装与使用
##### （一）、用户体系模块安装
以下操作假设您已安装好tars web管理系统。
<ol>
    <li>进入TarsWeb/demo/目录下,将demo文件夹里的内容拷贝至新建的单独的文件夹中。例如：新建UserManage文件夹</li>
    <li>进入新建文件夹UserManage的目录下运行npm install安装用户体系模块所需依赖。</li>
    <li>在MySQL数据库创建db_user_system（数据库名）数据库，运行UserManage/sql/目录下的db_user_system.sql文件生成相关表。</li>
    <li>在UserManage/config目录下编辑webConf.js文件配置数据库。
    <li>运行npm run prd命令启动用户体系模块。</li>
    <li>当项目成功运行起来之后，在TarsWeb/config目录下，loginConf.js文件中将enableLogin参数值改为true即可开启用户登录模块。</li>
</ol>
<strong>_注_：</strong>其中UserManage/config目录下的webConf.js只需修改下列选项即可。
    
    dbConf: {
            host: '127.0.0.1',       // 数据库地址
            port: '3306',            // 数据库端口
            user: 'root',            // 用户名
            password: 'admin12345',            // 密码
            charset: 'utf8_bin',     // 数据库编码
            pool: {
                max: 10,             // 连接池中最大连接数量
                min: 0,              // 连接池中最小连接数量
                idle: 10000          // 如果一个线程 10 秒钟内没有被使用过的话，那么就释放线程
            }
        },

##### （二）、用户体系模块使用
以下操作假设您已安装好tars web管理系统。

tars_web默认用户体系模块提供单点登录系统和权限系统，分别在TarsWeb/config目录下的loginConf.js配置登录模块以及在authConf.js中配置
权限模块。
#####  1、loginConf.js登录配置文件详细信息如下：
在用户体系模块安装完成运行成功之后，将enableLogin参数值改为true即可开启用户登录模块。(在使用默认用户体系模块的系统中不需要您修改其他参数)
```
{
        enableLogin: true,                        // 是否启用登录验证 true:开启 false: 关闭
	defaultLoginUid: 'admin',                     // 若不启用登录验证，默认用户为admin，可自行修改
	loginUrl: 'http://localhost:3001/login.html', // 登录跳转url
	redirectUrlParamName: 'redirect_url',         //跳转到登录url的时所带的原url参数名，如：***/login?service=***，默认是service
	logoutUrl: '',                                // 用户登出跳转页面链接，默认跳转到等哭页面
	logoutredirectUrlParamName: 'url',            // 跳转到登出页面时url所带的原URL的参数名
	ticketCookieName: 'ticket',                   //cookie中保存ticket信息的cookie名
	uidCookieName: 'uid',                         //cookie中保存用户信息的cookie名
	cookieDomain: 'localhost',                    //cookie值对应的域
	ticketParamName: 'ticket',                    //第三方登录服务回调时候，url中表示st的参数名
	getUidByTicket: getUidByTicket,               //通过ticket从cas服务端校验和获取用户基本信息的url,或获取用户基本信息的方法
	getUidByTicketParamName: 'ticket',            //调用获取用户信息接口时候st的参数名
	uidKey: 'data.uid',                           //结果JSON里面取出用户名的位置，取到该用户名才认为成功,可以多层
	validate: validate,                           //通过token和用户名到cas服务端校验key和用户名是否匹配的url或方法
	validateTicketParamName: 'ticket',            //校验接口传入st参数名
	validateUidParamName: 'uid',                  //校验接口传入用户参数名
	validateMatch: [
		['data.result', true]
	],                                            //校验通过匹配条件，可以从多层结果，多个情况
	ignore: ['/static'], //不需要登录校验的路径
	ignoreIps: [],                                //访问ip白名单
	apiPrefix: ['/pages/server/api'],             //接口相应的路径前缀，这类接口访问不直接跳转到登录界面，而只是提示未登录
	apiNotLoginMes: '#common.noLogin#',           //接口无登录权限的提示语
}
```
##### 2、authConf.js登录配置文件详细信息如下：
默认权限模块：权限模块数据库表中有三个字段，为flag，role和uid，分别对应标志（在TARS平台中为“应用+服务”表示一个标志），角色和用户。

权限模块对外提供6个接口和一个auth.html页面：
```
    /auth/addAuth： 批量新增权限接口，入参为[{flag: “”，role: “”，uid: “”}],
    /auth/deleteAuth：删除权限接口，入参为flag，删除flag下所有权限信息
    /auth/updateAuth：更新权限接口，入参为flag，role，uid，其中，uid为用户列表，表示更新某个flag和role下的所有用户信息。
    /auth/getAuthListByUid：获取某用户具有的全部权限列表，入参为uid
    /auth/getAuth：判断用户是否具有权限，入参为flag，role，uid。
    /auth/getAuthListByFlag：获取有某个flag权限的用户信息，入参为flag
	权限模块还提供了一个管理页面：
	/auth.html：用于对权限进行增删改查。
```

注意：默认的权限模块，为保证系统安全性，以上的列的6个接口，必须采用白名单的方式访问，不允许被其他人随意调用，管理页面Auth.html 需系统管理员才可使用。白名单和管理员的相关配置，可在UserManage/config/authConf.js中配置。


### 二、对接第三方用户体系模块操作指南
待完善......

## TARS 资源对接能力使用指引
TARS管理平台提供了由平台自动安装TARS Node的能力。当用户上线服务，或扩容服务之时，若相应IP未安装TARS Node，管理平台可通过ssh登录相应机器并安装TARS Node。
系统将对外提供“install_tars_node”和 “uninstall_tars_node”两个接口用于安装和卸载tars_node，具体可参见接口API文档.

**1、Tars Node安装包准备**

TARS Node 二进制包准备，用户需要从开发框架代码中，拷贝TARS Node的二进制包，并生成相应的tarsnode.tar.gz包，放在管理平台的files目录下。注意：一定要放在files目录下，且名称为tarsnode.tar.gz。

其中：需修改conf下的配置文件tarsnode.conf。需将localip，endpoint中的ip地址换成 {{machine_ip}} 这个特殊标志，管理平台执行安装时，会将 {{machine_ip}} 置换成待安装tarsnode的机器ip。

**2、设置配置文件**
资源管理相关的有两个对接配置文件，/config/resourceConf.js 和 /config/sshConf.json
其中，resouceConf文件，可配置两个字段
1）、enableAutoInstall： 若此值为true，则系统将在上线和扩容的时候，自动登录机器并安装Tars Node。
2）、getMachineConf： 由用户提供的获取机器信息的url，入参为ip，出参必须为：
​			
			{
				“data”: {
						“ip”: “127.0.0.1”,
						“port”: “3306”,
						“username”: “user”,
						“password”: “123456”
					}
			}
其中，data对象包含机器的ip，ssh端口，用户名和登录密码。

若不配置此接口，或此接口查询不到相应IP的机器信息，Tars管理平台允许配置sshConf.json文件，由用户提前准备好机器信息并填入，管理平台会到此配置文件下读取相应的机器信息。此文件也可直接修改，无需重启服务。
