const TokenService = require('../../service/token/TokenService')
const logger = require('../../../../app/logger');
// const logger = require('../../logger');
const util = require('../../tools/util');
const _ = require('lodash');

const TokenController = {}

const tokenStruct = {
    id: '',
    uid: '',
    token: '',
    valid: '',
    expire_time: '',
    update_time: ''
};

//获取所有用户列表
TokenController.getTokenList = async(ctx)=> {
    try {
        let rst = await TokenService.getTokenList(ctx.uid);
        ctx.makeResObj(200, '', util.viewFilter(rst || [], tokenStruct));
    }catch(e){
        logger.error('[getTokenList]', e, ctx);
        ctx.makeErrResObj();
    }
}; 

TokenController.addToken = async(ctx) => {
    try{
        let rst = await TokenService.addToken(ctx.uid, ctx.paramsObj.expire_time);
        ctx.makeResObj(200, '', util.viewFilter(rst || [], tokenStruct));
    }catch(e){
        logger.error('[addToken]', e, ctx);
        ctx.makeErrResObj();
    }
};

TokenController.deleteToken = async(ctx) => {
    try{
        let ids = ctx.paramsObj.id;

        await TokenService.deleteToken(ctx.uid, ids);
        ctx.makeResObj(200, '', {});
    }catch(e){
        logger.error('[deleteToken]', e, ctx);
        ctx.makeErrResObj();
    }
};

TokenController.setTokenValid = async(ctx) => {
    try{
        let id = ctx.paramsObj.id;

        let rst = await TokenService.setTokenValid(ctx.uid, id, ctx.paramsObj.valid);
        ctx.makeResObj(200, '', {rst});
    }catch(e){
        logger.error('[setTokenValid]', e, ctx);
        ctx.makeErrResObj();
    }
};


module.exports = TokenController;
