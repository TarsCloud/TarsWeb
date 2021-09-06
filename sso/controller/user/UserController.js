const UserService = require('../../service/user/UserService');
const AuthService = require('../../service/auth/AuthService');
const logger = require('../../../logger');
const util = require('../../../tools/util');
const _ = require('lodash');

const UserController = {}

//获取所有用户列表
UserController.getUserIdList = async(ctx)=> {
    try {
        let rst = await UserService.getUserIdList();
        ctx.makeResObj(200, '', rst || []);
    }catch(e){
        logger.error('[getUserIdList]', e.body ? e.body.message:e, ctx);
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}; 

UserController.getUserAuthList = async(ctx)=> {

    try {
        let rst = await UserService.getUserAuthList();

        ctx.makeResObj(200, '', rst || []);
    }catch(e){
        logger.error('[getUserAuthList]', e.body ? e.body.message:e, ctx);
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}; 

UserController.adminModifyPass = async(ctx)=> {
    if(await AuthService.isActivated()) {
        ctx.makeResObj(500, '#pass.setAdminPasswordFailed#', {});
        return;
    }
    let password = ctx.paramsObj.password;
    let repeatPassword = ctx.paramsObj.repeat_password;
    if(password != repeatPassword){
        ctx.makeResObj(500, '#pass.passwordDiff#', {});
        return;
    }

    try{
        let rst = await UserService.modifyPass('admin', password);

        // console.log(JSON.stringify(rst.body.spec));
        
        if(rst && rst.errMsg){
            ctx.makeResObj(500, rst.errMsg, {});
        }else{
            ctx.makeResObj(200, '#pass.modifySucc#', {});
        }
    }catch(e){
        logger.error('[adminModifyPass]', e.body ? e.body.message : e, ctx);
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }

}; 

UserController.modifyPass = async(ctx)=> {
    let password = ctx.paramsObj.password;
    let repeatPassword = ctx.paramsObj.repeat_password;
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
        logger.error('[modifyPass]', e.body ? e.body.message:e, ctx);
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }

}; 

UserController.addUser = async(ctx) => {
    try{
        let user = ctx.paramsObj.user;
        await UserService.addUser(user);
        ctx.makeResObj(200, '', {});
    }catch(e){
        logger.error('[addUser]', e.body ? e.body.message:e, ctx);
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
};

UserController.pageDeleteUser = async(ctx) => {
    try{
        let uids = ctx.paramsObj.uids;

        await UserService.deleteUser(uids);
        ctx.makeResObj(200, '', {});
    }catch(e){
        logger.error('[pageDeleteUser]', e.body ? e.body.message:e, ctx);
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
};

module.exports = UserController;
