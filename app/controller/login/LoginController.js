const logger = require('../../logger');

const LoginController = {};

LoginController.getLoginUid = async(ctx) =>{
    try{
        ctx.makeResObj(200, '', {uid: ctx.uid || ''});
    }catch(e){
        logger.error('[getLoginUid]', e);
        ctx.makeErrResObj();
    }
};

module.exports = LoginController;