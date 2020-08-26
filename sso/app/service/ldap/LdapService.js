// const extend = require('extend');
// const Promise = require('bluebird');
const ldapjs = require('ldapjs');
// const ldapConf = require('../../../../config/webConf').ldapConf;
const SetService = require('../../service/set/SetService');
const logger = require('../../../../app/logger');
const cache = require('memory-cache');

// 消息结果
const RETURN_MSG = {
    SUCCESS: {iRet: 0, message:''},                     // 成功
    LDAPKEY_ERROR: {iRet: -1001, message:'LDAPKEY error'},
    LDAPKEY_OUTDATE: {iRet: -1002, message:'LDAPKEY expire'},
    PASSWORD_ERROR: {iRet: -1003, message:'Password error'},
    PASSWORD_EXPIRED: {iRet: -1004, message:'Password expire'},
    PASSWORD_WILLEXPIRED: {iRet: -1005, message:'Password will expire'},
    PASSWORD_LOCKED: {iRet: -1006, message:'Password continue error, User has been locked!'},
    USER_ERROR: {iRet: -1008, message:'User not exists'},
    SERVER_ERROR: {iRet: -1007, message:'System error'},
    UNKNOWN_ERROR: {iRet: -9999, message:'Unknown error'}
}

// LDAP客户端对象
let ldapClient;

// 查询基本属性
const searchOpts = {
    scope: 'sub',
    attributes: ['uid', 'cn', 'mail', 'telephoneNumber', 'sn', 'photo', 'title', 'departmentNumber','pwdChangedTime','pwdFailureTime','pwdAccountLockedTime']
    // timeLimit: ldapConf.timeLimit                          // 查询接口超时时间，秒为单位
};

const LdapService = {};
LdapService.RETURN_MSG = RETURN_MSG;

/**
 * 创建LDAPclient
 */
LdapService.init = async()=> {

    let ldapConf = await SetService.ldapConf();

    logger.info(`LDAPClient init: ${ldapConf}`);
    
    if(ldapConf.enableLDAP) {
        try {
            ldapClient = ldapjs.createClient({
                url: ldapConf.url,
                reconnect: ldapConf.reconnect,
                timeout: ldapConf.timeout
            });

            // bluebird模块转化非标准的异步接口
            // Promise.promisifyAll(ldapClient);
            logger.info(`LDAPClient init|url:${ldapConf.url}|baseDN:${ldapConf.basedn}`);
        }catch(err) {
            logger.info(`LDAPClient fail`, err.message);
        }
    }

    return ldapConf;
};

/**
 * 解析LDAP用户属性值
 */
LdapService.getUserFromEntry = (entry)=> {
    const userInfo = {
        dn: entry.dn
    };
    const length = entry.attributes.length;

    for (var i = 0; i < length; i++) {
        if (entry.attributes[i].type == "uid") {
            userInfo.uid = entry.attributes[i].vals[0];
        } else if (entry.attributes[i].type == "cn") {
            userInfo.name = entry.attributes[i].vals[0];
        } else if (entry.attributes[i].type == "mail" ||
            entry.attributes[i].type == "email") {
            userInfo.email = entry.attributes[i].vals[0];
        } else if (entry.attributes[i].type == "telephoneNumber") {
            userInfo.tel = entry.attributes[i].vals[0];
        } else if (entry.attributes[i].type == "sn") {
            userInfo.surname = entry.attributes[i].vals[0];
        } else if (entry.attributes[i].type == "photo") {
            userInfo.avatar = entry.attributes[i].vals[0];
        } else if (entry.attributes[i].type == "title") {
            userInfo.position = entry.attributes[i].vals[0];
        } else if (entry.attributes[i].type == "departmentNumber") {
            userInfo.department = entry.attributes[i].vals[0];
        } else if (entry.attributes[i].type == "pwdChangedTime") {
            userInfo.pwdChangedTime = entry.attributes[i].vals[0];
        } else if (entry.attributes[i].type == "pwdFailureTime") {
            userInfo.pwdFailureTime = entry.attributes[i].vals[0];
        } else if (entry.attributes[i].type == "pwdAccountLockedTime") {
            userInfo.pwdAccountLockedTime = entry.attributes[i].vals[0];
        }
    }
    return userInfo;
}

/**
 * 查询用户信息,默认返回全部用户信息
 */
LdapService.searchUserInfoByFilter = (filter = {filter:"(uid=*)"}) => {
    return new Promise(async (resolve, reject) => {
        try {

            let ldapConf;

            if (!ldapClient) {
                ldapConf = await LdapService.init();
            } else {
                ldapConf = await SetService.ldapConf();
            }

            searchOpts.timeLimit = ldapConf.timeLimit;

            ldapClient.search(ldapConf.basedn, Object.assign({}, searchOpts, filter), function (err, res) {
                if (err) {
                    logger.error(`LdapService searchUserInfoByFilter error:`, filter, err);
                    reject(err);
                } else {
                    let userList = [];
                    res.on('searchEntry', function (entry) {
                        userList.push(LdapService.getUserFromEntry(entry));
                    });
                    res.on('error', function (err) {
                        logger.error(`LdapService searchUserInfoByFilter error:`, filter, err);
                        reject(err);
                    });
                    res.on('end', function (result) {
                        logger.info(`LdapService searchUserInfoByFilter end`)
                        resolve({iRet:0, userList})
                    });
                }
            });
        }catch(err) {
            logger.error(`LdapService searchUserInfoByFilter exception:`, filter, err);
            reject(err);
        }
    })
}

/**
 * 校验密码
 */
LdapService.bindPwd = (user, pwd) => {
    return new Promise((resolve, reject) => {
        try {
            ldapClient.bind(user.dn, pwd, function (err) {
                if (err) {
                    logger.error(`LdapService bindPwd error:`, user, err);
                    resolve(RETURN_MSG.PASSWORD_ERROR);
                } else {
                    logger.info(`uid:${user.uid}|LdapService bindPwd 认证成功Succ.`);
                    resolve({iRet:0});
                }
            });
        }catch(err) {
            logger.error(`LdapService bindPwd exception`, user, err);
            reject(err);
        }
    })
}

/**
 * LDAP认证登录
 */
LdapService.authenticateLogin = async(uid, pwd)=> {
    try {
        const user = await LdapService.searchUserInfoByFilter({filter: `(uid=${uid})`});
        if(user && user.iRet === 0) {
            if(user.userList.length > 0) {
                const authPwd = await LdapService.bindPwd(user.userList[0], pwd)
                if(authPwd && authPwd.iRet === 0) {
                    logger.info(`uid:${uid}LDAP登录认证成功`);
                    return RETURN_MSG.SUCCESS;
                }else {
                    logger.error(`uid:${uid}LDAP登录认证失败|密码校验失败`);
                    return RETURN_MSG.PASSWORD_ERROR;
                }
            }else {
                logger.error(`uid:${uid}LDAP登录认证失败|用户不存在`);
                return RETURN_MSG.USER_ERROR;
            }
        } else {
            logger.error(`uid:${uid}LDAP登录认证异常`, user);
            return RETURN_MSG.SERVER_ERROR;
        }
    }catch(err) {
        logger.error(`uid:${uid}LDAP登录认证异常`, err);
        return RETURN_MSG.SERVER_ERROR;
    }
}

/**
 * 获取LDAP所有用户
 */
LdapService.getAllUserList = async () => {
    let userRet = [];

    let ldapConf = await SetService.ldapConf();

    if (ldapConf.enableLDAP && ldapConf.syncAllUserSchedule){
        userRet = cache.get('ldapUserList') || [];
        console.log(`cache get ldapUserList succ.`)
    } else {
        userRet = await LdapService.searchUserInfoByFilter();
        if(userRet && userRet.iRet === 0) {
            userRet = userRet.userList.map(item=>{
                return {
                    uid: item.uid,
                    name: item.name
                }
            });
        }else {
            userRet = [];
        }
    }
    if(!(userRet[0] && userRet[0].uid === 'admin')) {
        userRet.unshift({uid: 'admin', name: 'admin'});
    }
    return userRet;
}


module.exports = LdapService;