const {
    enableAuth,
    authUrlPrefix,
    addAuthUrl,
    deleteAuthUrl,
    modifyAuthUrl,
    getAuthListByUidUrl,
    getAuthUrl,
    flagParamName,
    roleParamName,
    uidParamName,
} = require('../../../config/authConf');
const util = require('../../tools/util');
const logger = require('../../logger');
const _ = require('lodash');

const AuthService = {};

AuthService.hasDevAuth = async(application, serverName, uid) => {
    return await AuthService.checkHasAuth(application, serverName, 'operator;developer', uid);
};

AuthService.hasOpeAuth = async(application, serverName, uid) => {
    return await AuthService.checkHasAuth(application, serverName, 'operator', uid);
};

AuthService.hasAdminAuth = async(uid) => {
    return await AuthService.checkHasAuth('', '', 'admin', uid);
};

AuthService.checkHasAuth = async(application, serverName, role, uid) => {
    let hasAuth = false;
    if (serverName) {
        hasAuth = await AuthService.httpCallCheckAuth(application + '-' + serverName, role, uid);
    }
    if (!hasAuth) {
        if (application) {
            hasAuth = await AuthService.httpCallCheckAuth(application, role, uid);
        }
        if (!hasAuth) {
            hasAuth = await AuthService.httpCallCheckAuth('', 'admin', uid);
            if (!hasAuth) {
                return false;
            } else {
                return true;
            }
        } else {
            return true;
        }
    } else {
        return true;
    }
};

AuthService.httpCallCheckAuth = async(flag, roles, uid) => {
    var rst = await util.jsonRequest.get(authUrlPrefix + getAuthUrl, {
        flag: flag,
        role: roles,
        uid: uid
    });
    if(rst && rst.ret_code == 200){
        return  rst.data && rst.data.result || false;
    }else{
        throw (new Error(rst.err_msg));
    }
};

AuthService.getAuthListByUid = async(uid)=> {
    var rst = await util.jsonRequest.get(authUrlPrefix + getAuthListByUid, {
        uid: uid
    });
    if(rst && rst.ret_code == 200){
        return rst.data || [];
    }else{
        throw (new Error(rst.err_msg));
    }
};

AuthService.addAuth = async(application, serverName, operator, developer) => {
    let flag = application + (serverName ? ('.' + serverName) : '');
    let authList = [];
    _.isArray(operator) && operator.forEach((uid)=> {
        let authItem = {
            flag: flag,
            role: 'operator',
            uid: uid
        };
        authList.push(authItem);
    });
    _.isArray(developer) && developer.forEach((uid)=> {
        let authItem = {
            flag: flag,
            role: 'developer',
            uid: uid
        };
        authList.push(authItem);
    });
    let rst = await util.jsonRequest.post(authUrlPrefix + addAuthUrl, {auth: authList});
    if(rst && rst.ret_code == 200){
        return true;
    }else{
        throw (new Error(rst.err_msg));
    }
};


module.exports = {
    hasDevAuth: AuthService.hasDevAuth,
    hasOpeAuth: AuthService.hasOpeAuth,
    hasAdminAuth: AuthService.hasAdminAuth,
    getAuthListByUid: AuthService.getAuthListByUid,
    addAuth: AuthService.addAuth
};