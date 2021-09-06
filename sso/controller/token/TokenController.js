const TokenService = require('../../service/token/TokenService')
const logger = require('../../../logger');
const util = require('../../../tools/util');
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
        logger.error('[getTokenList]', e.body ? e.body.message:e, ctx);
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}; 

TokenController.addToken = async(ctx) => {
    try{
        let rst = await TokenService.addToken(ctx.paramsObj.name, ctx.uid, ctx.paramsObj.expire_time);
        ctx.makeResObj(200, '', util.viewFilter(rst || [], tokenStruct));
    }catch(e){
        logger.error('[addToken]', e.body ? e.body.message:e, ctx);
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
};

TokenController.deleteToken = async(ctx) => {
    try{
        let tokens = ctx.paramsObj.tokens;

        await TokenService.deleteToken(ctx.uid, tokens);
        ctx.makeResObj(200, '', {});
    }catch(e){
        logger.error('[deleteToken]', e.body ? e.body.message:e, ctx);
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
};

TokenController.setTokenValid = async(ctx) => {
    try{
        let token = ctx.paramsObj.token;

        let rst = await TokenService.setTokenValid(ctx.uid, token, ctx.paramsObj.valid);
        ctx.makeResObj(200, '', {rst});
    }catch(e){
        logger.error('[setTokenValid]', e.body ? e.body.message:e, ctx);
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
};


module.exports = TokenController;
