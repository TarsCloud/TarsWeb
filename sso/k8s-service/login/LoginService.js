const LdapService = require('../../../ldap/LdapService');
const SetService = require('../../service/set/SetService');
const UserService = require('../../service/user/UserService');
const bcrypt = require('bcrypt-nodejs');
const TokenService = require('../token/TokenService');

const expireTime = 7 * 24 *60 * 60 * 1000;

const LoginService = {};

LoginService.insertUserInfo = async (uid, password) => {
    return await UserService.addUser(uid, {uid, password})
}

LoginService.getUserInfoByUid = async (uid) => {

    let account = await UserService.getTAccount(uid);

    // if (account) {
    //     account = account.body;
    // }

    return account;
}

//登录操作
LoginService.login = async(uid, password)=> {
    // loginFailed

    let ldapConf = await SetService.ldapConf();

    if(ldapConf.enableLDAP && uid !== 'admin') {

        const LdapRet = await LdapService.authenticateLogin(uid, password);
        if(LdapRet.iRet !== 0) {
            if(LdapRet.iRet === LdapService.RETURN_MSG.SERVER_ERROR.iRet) {
                return {errMsg: '#login.loginFailed#'};
            } else if(LdapRet.iRet === LdapService.RETURN_MSG.PASSWORD_ERROR.iRet) {
                return {errMsg: '#login.passwordNoCorrect#'};
            } else if(LdapRet.iRet === LdapService.RETURN_MSG.USER_ERROR.iRet) {
                return {errMsg: '#login.userNoExist#'};
            }
        } 
        
        //用户不存在则创建用户
        await UserService.newTAccount(uid, true);

    } else {
        let userInfo = await LoginService.getUserInfoByUid(uid);

        if (userInfo) {
            //todo
            if (!bcrypt.compareSync(password, userInfo.spec.authentication.bcryptPassword)) {
                return {errMsg: '#login.passwordNoCorrect#'};
            } 

            await UserService.activeTAccount(uid);

        } else {
            return {errMsg: '#login.userNoExist#'};
        }
    }

    let ticket = TokenService.signWebIDToken({ uid: uid }, expireTime);
;
    return {ticket: ticket};
};

//注册操作
LoginService.register = async(uid, password) => {
    let userInfo = await LoginService.getUserInfoByUid(uid);
    if (userInfo) {
        return {errMsg: '#login.hasExist#'};
    } else {
        await LoginService.insertUserInfo(uid, password);
        return {};
    }
};

LoginService.getUidByTicket = async(ticket) => {

    let data = await TokenService.verifyWebIDToken(ticket);

    // console.log('getUidByTicket', data, ticket);

    return data.uid;
};


LoginService.validate = async(pUid, pTicket) => {
    let uid = await LoginService.getUidByTicket(pTicket);
    if (uid && uid === pUid) {
        return true;
    } else {
        return false;
    }
};

// LoginService.removeExpiresTgt();
// LoginService.initLoginTgtCache();

module.exports = LoginService;