var path = require('path');

//用户体系配置 auth.js
module.exports = {
    enableLogin: false,                     //是否启用登录验证
    defaultLoginUid: 'admin',                //若不启用登录验证，默认用户为admin
    loginUrlPrefix: 'http://localhost:3001', //登录检验服务前缀host
<<<<<<< HEAD
=======
    loginUrl: '/login.html',                 //登录跳转url
>>>>>>> 1c4f389360702e916a5d69bd909cba3b41b12222
    redirectUrlParamName: 'redirect_url',    //跳转到登录url的时带的原url参数名，如：***/login?service=***，默认是service
    ticketCookieName: 'ticket',             //cookie中保存ticket信息的cookie名
    uidCookieName: 'uid',                   //cookie中保存用户信息的cookie名
    cookieDomain: 'localhost',              //cookie值对应的域
    ticketParamName: 'ticket',              //第三方登录服务回调时候，url中表示st的参数名
    getUidByTicket: '/api/getUidByTicket',  //通过ticket从cas服务端校验和获取用户基本信息的url
    getUidByTicketParamName: 'ticket',      //调用获取用户信息接口时候st的参数名
    uidKey: 'data.uid',                     //结果JSON里面取出用户名的位置，取到该用户名才认为成功,可以多层
    validateUrl: '/api/validate',           //通过token和用户名到cas服务端校验key和用户名是否匹配url
    validateTicketParamName: 'ticket',      //校验接口传入st参数名
    validateUidParamName: 'uid',            //校验接口传入用户参数名
    validateMatch: [
        ['data.result', true]
    ],                                      //校验通过匹配条件，可以从多层结果，多个情况
    ignore: ['/static', '/tarsnode_install.sh'], //不需要登录校验的路径
    ignoreIps: [],                           //访问ip白名单
    apiPrefix: ['/pages/server/api'],       //接口相应的路径前缀
    apiNotLoginMes: '您还没有登录',         //接口无登录权限的提示语

    enableLocalCache: false,               //是否开启本地登录缓存
    maxAge: 7 * 24 * 60 * 60 * 1000        //本地登录缓存时间，默认7天
};