//第三方登录相关
let loginConf = require('../../config/loginConf');
let request = require('request-promise-any');
let _ = require('lodash');
let logger = require('../logger');
let ignoreList = _.concat([], loginConf.ignore || [], ['/favicon.ico']);  //讲登入登出校验接口放到忽略登录校验列表中，兼容本地登录情况
let url = require('url');

let cookieDomainConfig = {
    domain: loginConf.cookieDomain || '/'  //用户cookie域
};
let cookieConfig = Object.assign({
    maxAge: 365 * 24 * 60 * 60 * 1000,  //用户cookie过期时间为1年，
}, cookieDomainConfig);

//登录校验中间件
module.exports = async(ctx, next) => {
    if (ctx.request.path === '/logout') {
        ctx.cookies.set(loginConf.ticketCookieName || 'ticket', null, cookieDomainConfig);
        ctx.cookies.set(loginConf.uidCookieName || 'uid', null, cookieDomainConfig);
        toLogoutPage(ctx);
        return;
    } else if (!loginConf.enableLogin) {
        ctx.uid = loginConf.defaultLoginUid;
        await next();
    } else if (isInPath(ctx, ignoreList) || isInIgnoreIps(ctx, loginConf.ignoreIps || [])) {  //跳过用户配置的不需要验证的url或白名单IP
        ctx.uid = ctx.query['uid'] || loginConf.defaultLoginUid;
        await next();
    } else {
        let ticket, uid;
        let ticketFromQuery = ctx.query[loginConf.ticketParamName || 'ticket'];
        if (ticket = ticketFromQuery) {
            uid = await getUid(ctx, ticket);
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
        if (await checkIsLogin(ctx, uid, ticket)) {
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
function isInIgnoreIps(ctx, ignoreIps) {
    var ip = ctx.ip;
    return _.indexOf(ignoreIps || [], ip) > -1;
}

//检测是否登录
async function checkIsLogin(ctx, uid, ticket) {
    if (uid !== undefined && ticket !== undefined) {
        if (await validate(ctx, uid, ticket)) {
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
    ctx.redirect(loginConf.loginUrl + '?' + loginConf.redirectUrlParamName + '=' + encodeURIComponent(ctx.protocol + '://' + ctx.host + ctx.request.url));
}

//控制跳转到登出页面
async function toLogoutPage(ctx) {
    if(loginConf.logoutUrl){
        ctx.redirect(loginConf.logoutUrl + '?' + loginConf.logoutredirectUrlParamName + '=' + encodeURIComponent(ctx.protocol + '://' + ctx.host));
    }else{
        ctx.redirect(ctx.protocol + '://' + ctx.host);
    }
}

// 通过ticket获取用户信息
async function getUid(ctx, ticket) {
    try {
        if (!!loginConf.getUidByTicket) {
            if(_.isFunction(loginConf.getUidByTicket)){
                return await loginConf.getUidByTicket(ctx, ticket);
            }else{
                let uidInfo = await request.get(loginConf.getUidByTicket + '?' + loginConf.getUidByTicketParamName + '=' + ticket);
                try {
                    uidInfo = JSON.parse(uidInfo);
                } catch (e) {
                    logger.error(e);
                    uidInfo = false;
                }
                if (!uidInfo)return false;
                return _.result(uidInfo, loginConf.uidKey) || false;
            }
        } else {
            return false;
        }
    } catch (e) {
        logger.error(e);
        return false;
    }
}

//判断是否ticket和uid是否有效
async function validate(ctx, uid, ticket) {
    try {
        if (loginConf.validate) {   //如果没有配置校验接口，则表示此用户名直接有效直到过期
            if(_.isFunction(loginConf.validate)){
                return await loginConf.validate(ctx, uid, ticket);
            }else{
                let validateRet = await request.get(loginConf.validate + '?' + loginConf.validateTicketParamName + '=' + ticket + '&' + loginConf.validateUidParamName + '=' + uid);
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
        }else{
            return true;
        }
    } catch (e) {
        logger.error(e);
        throw(e);
        return false;
    }
}