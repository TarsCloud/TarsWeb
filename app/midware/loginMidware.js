//第三方登录相关

let loginConf = require('../../config/loginConf');
let request = require('request-promise-any');
let _ = require('lodash');
let logger = require('../logger');
let ignoreList = _.concat([], loginConf.ignore || [], ['/api/auth', '/auth', '/favicon.ico']);  //讲登入登出校验接口放到忽略登录校验列表中，兼容本地登录情况

let userSessionMap = {}; //内存中保存用户的登录信息
let cookieConfig = {
    maxAge: 365 * 24 * 60 * 60 * 1000  //用户cookie过期时间为1年
};


//登录校验中间件
module.exports = async(ctx, next) => {
    if (checkInIgnoreList(ctx)) {  //跳过用户配置的不需要验证的url
        await next();
    } else {
        let ticket, user;
        if (ticket = ctx.query[loginConf.ticketParamName || 'ticket']) {
            user = await getUserInfo(ticket);
            if (user) {
                await ctx.cookies.set(loginConf.ticketCookieName || 'ticket', ticket, cookieConfig);
                await ctx.cookies.set(loginConf.userInfoCookieName || 'user', user, cookieConfig);
            }
        }
        if(!user){
            user = ctx.cookies.get(loginConf.userInfoCookieName || 'user');
        }
        if(!ticket){
            ticket = ctx.cookies.get(loginConf.ticketCookieName || 'ticket');
        }
        if (await checkIsLogin(user, ticket)) {
            ctx.userName = user;
            await next();
        } else {
            toLoginPage(ctx);
        }
    }
};

//检测是否在ignore列表中
function checkInIgnoreList(ctx) {
    let pathname = ctx.request.path;
    let index = _.findIndex(ignoreList, function (rule) {
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

//检测是否登录
async function checkIsLogin(user, ticket) {
    // let user = ctx.cookies && ctx.cookies.get('user');
    // let ticket = ctx.cookies && ctx.cookies.get('ticket');
    if (user !== undefined && ticket !== undefined) {
        if (await validate(user, ticket)) {
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
    let loginUrl = loginConf.loginUrl;
    let redirectUrlParamName = loginConf.redirectUrlParamName;
    ctx.redirect(loginUrl + '?' + redirectUrlParamName + '=' + encodeURIComponent(ctx.protocol + '://' + ctx.host + ctx.request.url));
}

// 通过ticket获取用户信息
async function getUserInfo(ticket) {
    try {
        if (!!loginConf.getUserInfoByTicket) {
            let userInfo = await request.get(loginConf.loginUrlPrefix + loginConf.getUserInfoByTicket + '?' + loginConf.getUserInfoTicketParamName + '=' + ticket);
            try{
                userInfo = JSON.parse(userInfo);
            }catch(e){
                logger.error(e);
                userInfo = false;
            }
            if(!userInfo)return false;
            return _.result(userInfo, loginConf.userInfoKey) || false;
        } else {
            return false;
        }
    } catch (e) {
        logger.error(e);
        return false;
    }
}

//判断是否ticket和user是否有效
async function validate(user, ticket) {
    try {
        let rst = false;
        if (loginConf.enableLocalCache && userSessionMap[user] && userSessionMap[user].ticket === ticket) {
            if (userSessionMap[user].updateTime && (new Date()).getTime() - userSessionMap[user].updateTime < loginConf.maxAge) {
                rst = true;
            } else {          //如果本地缓存过期，则检测第三方缓存
                rst = await casServerValidate(ticket, user);
            }
        } else {
            rst = await casServerValidate(ticket, user);
        }
        if (rst) {
            if (!userSessionMap[user]) {
                userSessionMap[user] = {}
            }
            if (!userSessionMap[user].ticket) {
                userSessionMap[user].ticket = ticket;
            }
            userSessionMap[user].updateTime = (new Date()).getTime();
        }
        return rst;
    } catch (e) {
        logger.error(e);
        throw(e);
        return false;
    }
}


//通过ticket和用户名调用CAS服务，确认是否登录
async function casServerValidate(ticket, user) {
    try {
        if (loginConf.validateUrl) {   //如果没有配置校验接口，则表示此用户名直接有效直到过期
            let validateRet = await request.get(loginConf.loginUrlPrefix + loginConf.validateUrl + '?' + loginConf.validateTicketParamName + '=' + ticket + '&' + loginConf.validateUserParamName + '=' + user);
            try{
                validateRet = JSON.parse(validateRet);
            }catch(e){
                logger.error(e);
                validateRet = false;
            }
            if(!validateRet)return false;
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