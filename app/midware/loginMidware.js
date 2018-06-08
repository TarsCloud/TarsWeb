//第三方登录相关

let loginConf = require('../../config/loginConf');
let request = require('request-promise-any');
let _ = require('lodash');
let logger = require('../logger');
let ignoreList = _.concat([], loginConf.ignore || [], ['/api/auth', '/auth', '/favicon.ico']);  //讲登入登出校验接口放到忽略登录校验列表中，兼容本地登录情况
let url = require('url');

let loginCookieMap = {}; //内存中保存用户的登录信息
let cookieConfig = {
    maxAge: 365 * 24 * 60 * 60 * 1000,  //用户cookie过期时间为1年，
    domain: loginConf.cookieDomain || '/',
};


//登录校验中间件
module.exports = async(ctx, next) => {
    if(ctx.request.path === '/logout'){
        ctx.cookies.set(loginConf.ticketCookieName || 'ticket', null);
        ctx.cookies.set(loginConf.uidCookieName || 'uid', null);
        ctx.redirect('/');
        return;
    } else if(!loginConf.enableLogin){
        ctx.uid = loginConf.defaultLoginUid;
        await next();
    }else if (isInPath(ctx, ignoreList)) {  //跳过用户配置的不需要验证的url
        await next();
    } else if (isInIgnoreIps(ctx, loginConf.ignoreIps || [])) {
        ctx.uid = ctx.query['uid'];
        await next();
    } else {
        let ticket, uid;
        let ticketFromQuery = ctx.query[loginConf.ticketParamName || 'ticket'];
        if (ticket = ticketFromQuery) {
            uid = await getUid(ticket);
            if (uid) {
                await ctx.cookies.set(loginConf.ticketCookieName || 'ticket', ticket, cookieConfig);
                await ctx.cookies.set(loginConf.uidCookieName || 'uid', uid, cookieConfig);
            }
        }
        if (!uid) {
            uid = ctx.cookies.get(loginConf.uidCookieName || 'uid');
        }
        if (!ticket) {
            ticket = ctx.cookies.get(loginConf.ticketCookieName || 'ticket');
        }
        if (await checkIsLogin(uid, ticket)) {
            ctx.uid = uid;
            if (ticketFromQuery) {
                let urlObj = url.parse(ctx.request.url, true);
                delete(urlObj.query[loginConf.ticketParamName || 'ticket']);
                delete(urlObj.search);
                let redirectUrl = url.format(urlObj);
                ctx.redirect(redirectUrl);
            } else {
                await next();
            }
        } else {
            if (isInPath(ctx, loginConf.apiPrefix)) {
                ctx.body = {ret_code: 500, err_msg: loginConf.apiNotLoginMes, data: {}}
            } else {
                toLoginPage(ctx);
            }
        }
    }
};

//检测是否在path列表中
function isInPath(ctx, pathList) {
    let pathname = ctx.request.path;
    let index = _.findIndex(pathList, function (rule) {
        if (!rule) {
            return false;
        } else if (typeof rule === 'string') {
            return pathname.indexOf(rule) == 0;
        } else if (rule instanceof RegExp) {
            return rule.test(pathname);
        }
    });
    return index > -1;
}

//检测是否在IP白名单之中
function isInIgnoreIps(ctx, ignoreIps){
    var ip = ctx.request.ip;
    return _.indexOf(ignoreIps||[], ip) > -1;
}

//检测是否登录
async function checkIsLogin(uid, ticket) {
    if (uid !== undefined && ticket !== undefined) {
        if (await validate(uid, ticket)) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

//控制跳转到登录页面
async function toLoginPage(ctx) {
    ctx.redirect(loginConf.loginUrlPrefix + loginConf.loginUrl + '?' + loginConf.redirectUrlParamName + '=' + encodeURIComponent(ctx.protocol + '://' + ctx.host + ctx.request.url));
}

// 通过ticket获取用户信息
async function getUid(ticket) {
    try {
        if (!!loginConf.getUidByTicket) {
            let uidInfo = await request.get(loginConf.loginUrlPrefix + loginConf.getUidByTicket + '?' + loginConf.getUidByTicketParamName + '=' + ticket);
            try {
                uidInfo = JSON.parse(uidInfo);
            } catch (e) {
                logger.error(e);
                uidInfo = false;
            }
            if (!uidInfo)return false;
            return _.result(uidInfo, loginConf.uidKey) || false;
        } else {
            return false;
        }
    } catch (e) {
        logger.error(e);
        return false;
    }
}

//判断是否ticket和uid是否有效
async function validate(uid, ticket) {
    try {
        let rst = false;
        if (loginConf.enableLocalCache && loginCookieMap[uid] && loginCookieMap[uid].ticket === ticket) {
            if (loginCookieMap[uid].updateTime && (new Date()).getTime() - loginCookieMap[uid].updateTime < loginConf.maxAge) {
                rst = true;
            } else {    //如果本地缓存过期，则检测第三方缓存
                rst = await casServerValidate(ticket, uid);
            }
        } else {
            rst = await casServerValidate(ticket, uid);
        }
        if (rst) {
            if (!loginCookieMap[uid]) {
                loginCookieMap[uid] = {}
            }
            if (!loginCookieMap[uid].ticket) {
                loginCookieMap[uid].ticket = ticket;
            }
            loginCookieMap[uid].updateTime = (new Date()).getTime();
        }
        return rst;
    } catch (e) {
        logger.error(e);
        throw(e);
        return false;
    }
}


//通过ticket和用户名调用CAS服务，确认是否登录
async function casServerValidate(ticket, uid) {
    try {
        if (loginConf.validateUrl) {   //如果没有配置校验接口，则表示此用户名直接有效直到过期
            let validateRet = await request.get(loginConf.loginUrlPrefix + loginConf.validateUrl + '?' + loginConf.validateTicketParamName + '=' + ticket + '&' + loginConf.validateUidParamName + '=' + uid);
            try {
                validateRet = JSON.parse(validateRet);
            } catch (e) {
                logger.error(e);
                validateRet = false;
            }
            if (!validateRet)return false;
            let validateMatch = loginConf.validateMatch;
            for (let i = 0; i < validateMatch.length; i++) {
                if (_.result(validateRet, validateMatch[i][0]) != validateMatch[i][1]) {
                    return false;
                }
            }
        }
        return true;
    } catch (e) {
        logger.error(e);
        return false;
    }
}