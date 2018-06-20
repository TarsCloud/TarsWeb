var path = require('path');

//用户体系配置 auth.js
module.exports = {
    enableLogin: true,                     //是否启用登录验证
    defaultLoginUid: 'admin',                //若不启用登录验证，默认用户为admin
    loginUrl: 'http://passport.oa.com/modules/passport/signin.ashx',                 //登录跳转url
    redirectUrlParamName: 'url',    //跳转到登录url的时带的原url参数名，如：***/login?service=***，默认是service

    logoutUrl: 'http://passport.oa.com/modules/passport/signout.ashx',
    logoutredirectUrlParamName: 'url',

    ticketCookieName: 'ticket',             //cookie中保存ticket信息的cookie名
    uidCookieName: 'uid',                   //cookie中保存用户信息的cookie名
    cookieDomain: 'wsd.com',              //cookie值对应的域
    ticketParamName: 'ticket',              //第三方登录服务回调时候，url中表示st的参数名

    // getUidByTicket: 'http://oss.api.tof.oa.com/api/v1/Passport/DecryptTicketWithClientIP',  //通过ticket从cas服务端校验和获取用户基本信息的url
    getUidByTicket: getUidByTicket,         //通过ticket从cas服务端校验和获取用户基本信息的url
    getUidByTicketParamName: 'ticket',      //调用获取用户信息接口时候st的参数名
    uidKey: 'data.uid',                     //结果JSON里面取出用户名的位置，取到该用户名才认为成功,可以多层
    validate: validate,                           //通过token和用户名到cas服务端校验key和用户名是否匹配url
    validateTicketParamName: 'ticket',      //校验接口传入st参数名
    validateUidParamName: 'uid',            //校验接口传入用户参数名
    validateMatch: [
        ['data.result', true]
    ],                                      //校验通过匹配条件，可以从多层结果，多个情况
    ignore: ['/static', '/tarsnode.tar.gz'], //不需要登录校验的路径
    ignoreIps: [],                           //访问ip白名单
    apiPrefix: ['/pages/server/api'],       //接口相应的路径前缀
    apiNotLoginMes: '#common.noLogin#', //接口无登录权限的提示语
};

var tof3 = require('@tencent/tof').tof3;
let _sysId = 22705;
let _appKey = 'b4e856be75584beab77e71f5f2efcd0f';
tof3.config({sysId: _sysId, appKey: _appKey});
tof3.setReqHost('oss.api.tof.oa.com');

/**
 * 由用户直接定制通过ticket获取用户信息的方法
 * @param ctx
 */
async function getUidByTicket(ctx, ticket){
    //TODO
    return new Promise((resolve, reject)=>{
        try{
            tof3.passport.decryptTicketWithClientIP({ // 验证ticket的合法性
                appkey: _appKey,
                encryptedTicket: ticket,
                browseIP: ctx.sourceIp
            }, function (err, data) {
                if (err) {
                    throw err;
                }
                if (data) {
                    resolve(data.LoginName);
                } else {
                    resolve(false)
                }
            });
        }catch(e){
            resolve(false)
        }
    })
}

/**
 * 由用户直接定制判断用户名校验方法
 * @param ctx
 */
async function validate(ctx, uid, ticket){
    //TODO
    return new Promise((resolve, reject)=>{
        try{
            tof3.passport.decryptTicketWithClientIP({ // 验证ticket的合法性
                appkey: _appKey,
                encryptedTicket: ticket,
                browseIP: ctx.sourceIp
            }, function (err, data) {
                if (err) {
                    throw err;
                }
                if (data) {
                    resolve(data.LoginName === uid);
                } else {
                    resolve(false)
                }
            });
        }catch(e){
            resolve(false)
        }
    })
}
