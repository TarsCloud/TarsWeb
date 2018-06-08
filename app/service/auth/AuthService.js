const {
    enableAuth,
    authUrlPrefix,
    addAuthUrl,
    deleteAuthUrl,
    updateAuthUrl,
    getAuthListByUidUrl,
    getAuthUrl,
    getAuthListByFlagUrl,
} = require('../../../config/authConf');
const util = require('../../tools/util');
const logger = require('../../logger');
const _ = require('lodash');
const ServerDao = require('../../dao/ServerDao');

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
    if (!enableAuth) {
        return true;
    }
    let hasAuth = false;
    if (serverName) {
        hasAuth = await AuthService.httpCallCheckAuth(application + '.' + serverName, role, uid);
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
    if (rst && rst.ret_code == 200) {
        return rst.data && rst.data.result || false;
    } else {
        throw (new Error(rst.err_msg));
    }
};

AuthService.getAuthListByUid = async(uid)=> {
    if (!enableAuth) {
        return [];
    }
    var rst = await util.jsonRequest.get(authUrlPrefix + getAuthListByUidUrl, {
        uid: uid
    });
    if (rst && rst.ret_code == 200) {
        let list = rst.data;
        let authList = [];
        list.forEach((auth)=> {
            let flag = auth.flag;
            let idx = flag.indexOf('.');
            if (idx > 1) {
                authList.push({application: flag.substring(0, idx), serverName: flag.substring(idx + 1)})
            } else {
                authList.push({application: flag})
            }
        });
        return authList || [];
    } else {
        throw (new Error(rst.err_msg));
    }
};

AuthService.formatUidToArray = (uids)=> {
    let uidArr = [];
    if (_.isString(uids)) {
        uids = _.trim(uids, /;|,/);
        if (uids)uidArr = uids.split(/;|,/);
    } else if (_.isArray(uids)) {
        uidArr = uids;
    }
    return uidArr;
};

AuthService.formatAddAuthParams = (flag, operator, uids) => {
    let authList = [];
    uids = AuthService.formatUidToArray(uids);
    _.isArray(uids) && uids.forEach((uid)=> {
        if (!uid)return;
        let authItem = {
            flag: flag,
            role: operator,
            uid: uid
        };
        authList.push(authItem);
    });
    return authList;
};

AuthService.addAuth = async(application, serverName, operator, developer) => {
    if (!enableAuth) {
        return true;
    }
    let flag = application + (serverName ? ('.' + serverName) : '');
    let authList = _.concat(AuthService.formatAddAuthParams(flag, 'operator', operator), AuthService.formatAddAuthParams(flag, 'developer', developer))
    let rst = await util.jsonRequest.post(authUrlPrefix + addAuthUrl, {auth: authList});
    if (rst && rst.ret_code == 200) {
        return true;
    } else {
        throw (new Error(rst.err_msg));
    }
};

AuthService.updateAuth = async(application, serverName, operator, developer)=> {
    if (!enableAuth) {
        return true;
    }
    let flag = application + (serverName ? ('.' + serverName) : '');
    operator = AuthService.formatUidToArray(operator);
    developer = AuthService.formatUidToArray(developer);
    let rst = await Promise.all([
        util.jsonRequest.post(authUrlPrefix + updateAuthUrl, {flag: flag, role: 'operator', uid: operator}),
        util.jsonRequest.post(authUrlPrefix + updateAuthUrl, {flag: flag, role: 'developer', uid: developer})
    ]);
    for (var i = 0; i < rst.length; i++) {
        if (!rst[i] || rst[i].ret_code != 200) {
            throw new Error(rst[i].err_msg);
            return false;
        }
    }
    return true;
};

AuthService.getAuthList = async(application, serverName) => {
    if (!enableAuth) {
        return [];
    }
    let rst = await util.jsonRequest.get(authUrlPrefix + getAuthListByFlagUrl, {flag: application + '.' + serverName});
    let authList = {
        operator: [],
        developer: []
    };
    if (rst.ret_code == 200) {
        rst.data.forEach((auth)=> {
            if (auth.role == 'operator') {
                authList.operator.push(auth.uid);
            } else if (auth.role == 'developer') {
                authList.developer.push(auth.uid);
            }
        });
    } else {
        throw new Error(rst.err_msg);
    }
    return authList;
};

//检测是否有顶层目录的权限，主要用于获取配置列表等
AuthService.checkHasParentAuth = async(params)=> {
    if(!enableAuth || await AuthService.hasAdminAuth(params.uid)){
        return true;
    }
    let authList = await AuthService.getAuthListByUid(params.uid);
    let serverCond = [], appCond = [];
    authList.forEach((auth)=>{
        let application = auth.application;
        let serverName = auth.serverName;
        if(serverName){
            serverCond.push(application + '.' + serverName);
        }else{
            appCond.push(application);
        }
    });
    let serverList = await ServerDao.getServerConf4Tree(appCond, serverCond);
    let {application, setName, setArea, setGroup, serverName} = params;
    let hasAuth = false;
    _.each(serverList, (server)=>{
        server = server.dataValues;
        if((!application || application == server.application) &&
            (!setName || setName == server.set_name) &&
            (!setArea || setArea == server.set_area) &&
            (!setGroup || setGroup == server.set_group) &&
            (!serverName || serverName == server.server_name)){
            hasAuth = true;
            return false;
        }
    });
    return hasAuth;
};

module.exports = AuthService;