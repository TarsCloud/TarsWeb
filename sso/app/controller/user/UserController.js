const UserService = require('../../service/user/UserService');
const AuthService = require('../../service/auth/AuthService');
const LdapService = require('../../service/ldap/LdapService');
const SetService = require('../../service/set/SetService');
// const ldapConf = require('../../../../config/webConf').ldapConf;
const logger = require('../../../../app/logger');
// const logger = require('../../logger');
const util = require('../../tools/util');
const _ = require('lodash');

const UserController = {}

const userStruct = {
    id: '',
    uid: '',
    update_time: ''
};

//获取所有用户列表
UserController.getUserIdList = async(ctx)=> {
    try {

        let ldapConf = await SetService.ldapConf();

        if(ldapConf.enableLDAP) {
            let userRet =  await LdapService.getAllUserList();
            ctx.makeResObj(200, '', userRet);
        } else {
            let rst = await UserService.getUserIdList();
            ctx.makeResObj(200, '', util.viewFilter(rst || [], userStruct));
        }
    }catch(e){
        logger.error('[getUserIdList]', e, ctx);
        ctx.makeErrResObj();
    }
}; 

UserController.adminModifyPass = async(ctx)=> {
    if(!AuthService.isInit()) {
        ctx.makeResObj(500, '#pass.setAdminPasswordFailed#', {});
        return;
    }
    let password = ctx.paramsObj.password;
    let repeatPassword = ctx.paramsObj.repeat_password;
    // console.log('modifyPass', password, repeatPassword);
    if(password != repeatPassword){
        ctx.makeResObj(500, '#pass.passwordDiff#', {});
        return;
    }

    try{
        let rst = await UserService.modifyPass('admin', password);
        if(rst && rst.errMsg){
            ctx.makeResObj(500, rst.errMsg, {});
        }else{
            ctx.makeResObj(200, '#pass.modifySucc#', {});
        }
    }catch(e){
        logger.error('[adminModifyPass]', e, ctx);
        ctx.makeErrResObj();
    }

}; 

UserController.modifyPass = async(ctx)=> {
    let password = ctx.paramsObj.password;
    let repeatPassword = ctx.paramsObj.repeat_password;
    // console.log('modifyPass', password, repeatPassword);
    if(password != repeatPassword){
        ctx.makeResObj(500, '#pass.passwordDiff#', {});
        return;
    }

    try{
        let uid = ctx.uid || [];
        let rst = await UserService.modifyPass(uid, password);
        if(rst && rst.errMsg){
            ctx.makeResObj(500, rst.errMsg, {});
        }else{
            ctx.makeResObj(200, '#pass.modifySucc#', {});
        }
    }catch(e){
        logger.error('[modifyPass]', e, ctx);
        ctx.makeErrResObj();
    }

}; 

UserController.addUser = async(ctx) => {
    try{
        let user = ctx.paramsObj.user;
        await UserService.addUser(user);
        ctx.makeResObj(200, '', {});
    }catch(e){
        logger.error('[addUser]', e, ctx);
        ctx.makeErrResObj();
    }
};

UserController.pageDeleteUser = async(ctx) => {
    try{
        let user = ctx.paramsObj.id;

        await UserService.deleteUser(user);
        ctx.makeResObj(200, '', {});
    }catch(e){
        logger.error('[pageDeleteUser]', e, ctx);
        ctx.makeErrResObj();
    }
};

module.exports = UserController;
