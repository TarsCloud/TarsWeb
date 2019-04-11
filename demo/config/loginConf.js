

/**
 * 登录配置
 */
module.exports = {
    enableLogin: false,                     //是否启用登录验证
    defaultLoginUid: 'admin',                //若不启用登录验证，默认用户为admin
    loginUrl: '',                 //登录跳转url
    redirectUrlParamName: 'url',    //跳转到登录url的时带的原url参数名，如：***/login?service=***，默认是service
    logoutUrl: '',
    logoutredirectUrlParamName: 'url',
    ticketCookieName: 'ticket',             //cookie中保存ticket信息的cookie名
    uidCookieName: 'uid',                   //cookie中保存用户信息的cookie名
    cookieDomain: 'localhost',              //cookie值对应的域
    ticketParamName: 'ticket',              //第三方登录服务回调时候，url中表示st的参数名
    getUidByTicket: '',         //通过ticket从cas服务端校验和获取用户基本信息的url,或获取用户基本信息的方法
    getUidByTicketParamName: 'ticket',      //调用获取用户信息接口时候st的参数名
    uidKey: 'data.uid',                     //结果JSON里面取出用户名的位置，取到该用户名才认为成功,可以多层
    validate: '',                     //通过token和用户名到cas服务端 ignore: ['/static', '/login.html', '/register.html', '/api/login', '/api/register', '/logout', '/api/getUidByTicket', '/api/validate'], //不需要登录校验的路径校验key和用户名是否匹配的url或方法
    validateTicketParamName: 'ticket',      //校验接口传入st参数名
    validateUidParamName: 'uid',            //校验接口传入用户参数名
    validateMatch: [
        ['data.result', true]
    ],                                      //校验通过匹配条件，可以从多层结果，多个情况
    ignore: [],
    ignoreIps: ['127.0.0.1'],          //访问ip白名单
    apiPrefix: ['/api'],                    //接口相应的路径前缀，这类接口访问不直接跳转到登录界面，而只是提示未登录
    apiNotLoginMes: '#login.noLogin#',     //接口无登录权限的提示语
};

