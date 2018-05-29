const logger = require('../../logger');
const _ = require('lodash');
const util = require('../../tools/util');
const AuthService = require('../../service/auth/AuthService');

const AuthController = {};

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