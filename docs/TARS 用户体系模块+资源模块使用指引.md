## TARS 用户体系模块使用指引
TARS管理平台提供了与用户体系（包括单点登录系统和权限系统）对接的能力，若用户本身无相应的系统，TARS可提供了一个简易的用户体系模块，供用户选装。用户体系模块提供了单点登录和注册的功能，以及到服务层级的权限控制能力。用户也可以选择只使用其中一个功能。
#### 一、默认用户体系模块安装与使用

##### （一）、用户体系模块

tars web自带了用户管理模块.

当项目成功运行起来之后，在TarsWeb/config目录下，loginConf.js文件中将enableLogin参数值改为true即可开启用户登录模块。

##### （二）、用户体系模块使用
以下操作假设您已安装好tars web管理系统。

tars_web默认用户体系模块提供单点登录系统和权限系统，分别在TarsWeb/config目录下的loginConf.js配置登录模块以及在authConf.js中配置
权限模块。

#####  1、loginConf.js登录配置文件详细信息如下：
在用户体系模块安装完成运行成功之后，将enableLogin参数值改为true即可开启用户登录模块。(在使用默认用户体系模块的系统中不需要您修改其他参数)
```
{
    enableLogin: true,                            // 是否启用登录验证 true:开启 false: 关闭
	defaultLoginUid: 'admin',                     // 若不启用登录验证，默认用户为admin，可自行修改
	loginUrl: '/login.html', 					  // 登录跳转url(代码中会替换localhost)
	redirectUrlParamName: 'redirect_url',         //跳转到登录url的时所带的原url参数名，如：***/login?service=***，默认是service
	logoutUrl: '',                                // 用户登出跳转页面链接，默认跳转到等哭页面
	userCenterUrl: '/auth.html',   	  			  //用户中心url
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
	ignoreIps: ['127.0.0.1'],                     //访问ip白名单
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
```

注意：默认的权限模块，为保证系统安全性，以上的列的6个接口，必须采用白名单的方式访问，不允许被其他人随意调用，管理页面Auth.html 需系统管理员才可使用。白名单和管理员的相关配置，可在UserManage/config/authConf.js中配置。


### 二、对接第三方用户体系模块操作指南

后续会开放和ldap的用户体系对接.

