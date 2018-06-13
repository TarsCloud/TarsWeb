const logger = require('../../logger');
const loginConf = require('../../../config/loginConf');

const LoginController = {};

LoginController.isEnableLogin = async(ctx) =>{
    try{
        ctx.makeResObj(200, '', {enableLogin: loginConf.enableLogin || false});
    }catch(e){
        logger.error('[getLoginUid]', e);
        ctx.makeErrResObj();
    }
};

LoginController.getLoginUid = async(ctx) =>{
    try{
        ctx.makeResObj(200, '', {uid: ctx.uid || ''});
    }catch(e){
        logger.error('[getLoginUid]', e);
        ctx.makeErrResObj();
    }
};

module.exports = LoginController;