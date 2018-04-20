//第三方登录相关

var authConf = require('../../config/authConf').authConf;
var request = require('request-promise-any');
var _ = require('lodash');
var logger = require('../logger');
var ignoreList = _.concat([], authConf.ignore || [], ['/api/auth', '/auth', '/favicon.ico']);  //讲登入登出校验接口放到忽略登录校验列表中，兼容本地登录情况

var userSessionMap = {}; //内存中保存用户的登录信息
var cookieConfig = {
    maxAge: 365 * 24 * 60 * 60 * 1000  //用户cookie过期时间为1年
};


//登录校验中间件
module.exports = async(ctx, next) => {
    if (checkInIgnoreList(ctx)) {  //跳过用户配置的不需要验证的url
        await next();
    } else {
        var ticket;
        if (ticket = ctx.query[authConf.ticketParamName || 'ticket']) {
            var user = await getUserInfo(ticket);
            if (user) {
                ctx.cookies.set('ticket', ticket, cookieConfig);
                ctx.cookies.set('user', user, cookieConfig);
            }
        }
        if (await checkIsLogin(ctx)) {
            ctx.userName = user;
            await next();
        } else {
            toLoginPage(ctx);
        }
    }
};

//检测是否在ignore列表中
function checkInIgnoreList(ctx) {
    var pathname = ctx.request.path;
    var index = _.findIndex(ignoreList, function (rule) {
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
async function checkIsLogin(ctx) {
    var user = ctx.cookies && ctx.cookies.get('user');
    var ticket = ctx.cookies && ctx.cookies.get('ticket');
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
    var loginUrl = authConf.loginUrl;
    var redirectUrlParamName = authConf.redirectUrlParamName;
    ctx.redirect(loginUrl + '?' + redirectUrlParamName + '=' + encodeURIComponent(ctx.protocol + '://' + ctx.host + ctx.request.url));
}

// 通过ticket获取用户信息
async function getUserInfo(ticket) {
    try {
        if (!!authConf.getUserInfoByTicket) {
            var userInfo = await request.get(authConf.loginUrlPrefix + authConf.getUserInfoByTicket + '?' + authConf.getUserInfoTicketParamName + '=' + ticket);
            try{
                userInfo = JSON.parse(userInfo);
            }catch(e){
                logger.error(e);
                userInfo = false;
            }
            if(!userInfo)return false;
            return getObjectValue(userInfo, authConf.userInfoKey) || false;
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
        var rst = false;
        if (authConf.enableLocalCache && userSessionMap[user] && userSessionMap[user].ticket === ticket) {
            if (userSessionMap[user].updateTime && (new Date()).getTime() - userSessionMap[user].updateTime < authConf.maxAge) {
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
        if (authConf.validateUrl) {   //如果没有配置校验接口，则表示此用户名直接有效直到过期
            var validateRet = await request.get(authConf.loginUrlPrefix + authConf.validateUrl + '?' + authConf.validateTicketParamName + '=' + ticket + '&' + authConf.validateUserParamName + '=' + user);
            try{
                validateRet = JSON.parse(validateRet);
            }catch(e){
                logger.error(e);
                validateRet = false;
            }
            if(!validateRet)return false;
            var validateMatch = authConf.validateMatch;
            for (var i = 0; i < validateMatch.length; i++) {
                if (getObjectValue(validateRet, validateMatch[i][0]) != validateMatch[i][1]) {
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

//依据字符串表示的字段深度，从obj中取出相应的值
function getObjectValue(obj, keyStr) {
    if (!_.isObject(obj)) {
        return undefined;
    }
    var keys = keyStr.split('.');
    _.each(keys, (key) => {
        obj = obj[key];
        if (!_.isObject(obj)) {
            return false;
        }
    });
    return obj;
}