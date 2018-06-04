const logger = require('../../logger');
const _ = require('lodash');
const util = require('../../tools/util');
const AuthService = require('../../service/auth/AuthService');
const authConf = require('../../../config/authConf');

const AuthController = {};

AuthController.isEnableAuth = async(ctx) =>{
    try{
        ctx.makeResObj(200, '', {enableAuth: authConf.enableAuth});
    }catch(e){
        logger.error('[isEnableAuth]', e);
        ctx.makeErrResObj();
    }
};

AuthController.hasAuth = async(ctx) => {
    try{
        let application = ctx.paramsObj.application;
        let serverName = ctx.paramsObj.server_name;
        let role = ctx.paramsObj.role;
        let func = '';
        switch (role){
            case 'developer':
                func = AuthService.hasDevAuth;
                break;
            case 'operator':
                func = AuthService.hasOpeAuth;
                break;
            default:
                func = AuthService.hasAdminAuth;
                break;
        }
        ctx.makeResObj(200, '', {has_auth: await func(application, serverName, ctx.uid)});
    }catch(e){
        logger.error('[isEnableAuth]', e);
        ctx.makeErrResObj();
    }
};

AuthController.getAuthList = async(ctx) => {
    try{
        let application = ctx.paramsObj.application;
        let serverName = ctx.paramsObj.server_name;
        let rst = await AuthService.getAuthList(application, serverName);
        ctx.makeResObj(200, '', rst);
    }catch(e){
        logger.error('[getUidList]', e);
        ctx.makeErrResObj();
    }
};

AuthController.updateAuth = async(ctx) => {
    try{
        let application = ctx.paramsObj.application;
        let serverName = ctx.paramsObj.server_name;
        let operator = ctx.paramsObj.operator || '';
        let developer = ctx.paramsObj.developer || '';
        await AuthService.modifyAuth(application, serverName, operator, developer);
        ctx.makeResObj(200, '', {});
    }catch(e){
        logger.error('[getUidList]', e);
        ctx.makeErrResObj();
    }
};

module.exports = AuthController;