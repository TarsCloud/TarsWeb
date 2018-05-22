var path = require('path');

//用户体系配置 auth.js
module.exports = {
    loginUrlPrefix: 'http://localhost:3001', //登录检验服务前缀host
    loginUrl: '/login.html',                 //登录跳转url
    redirectUrlParamName: 'redirect_url',    //跳转到登录url的时带的原url参数名，如：***/login?service=***，默认是service
    logoutUrl: '/logout',                   //登出url
    ticketCookieName: 'ticket',             //cookie中保存ticket信息的cookie名
    userInfoCookieName: 'uid',              //cookie中保存用户信息的cookie名
    ticketParamName: 'ticket',              //第三方登录服务回调时候，url中表示st的参数名
    getUserInfoByTicket: '/api/getUidByTicket',       //通过ticket从cas服务端校验和获取用户基本信息的url
    getUserInfoTicketParamName: 'ticket',   //调用获取用户信息接口时候st的参数名
    userInfoKey: 'data.uid',                //结果JSON里面取出用户名的位置，取到该用户名才认为成功,可以多层
    validateUrl: '/api/validate',           //通过token和用户名到cas服务端校验key和用户名是否匹配url
    validateTicketParamName: 'ticket',      //校验接口传入st参数名
    validateUserParamName: 'uid',          //校验接口传入用户参数名
    validateMatch: [
        ['data.result', true]
    ],                                      //校验通过匹配条件，可以从多层结果，多个情况
    ignore: ['/css', '/js', '/img'],        //不需要登录校验的规则
    enableLocalCache: false,                //是否开启本地登录缓存
    maxAge: 7 * 24 * 60 * 60 * 1000        //本地登录缓存时间，默认7天
};