const limit = require('koa-limit');
const limitConf = require('../../config/webConf').limitConf || {};

module.exports = () => {
    if(limitConf.enableLimit){
        return limit({
            limit: limitConf.limit || 5000,
            interval: limitConf.interval || 1000 * 60 * 60,
            whiteList: limitConf.whilteList || [],
            blackList: limitConf.blackList || [],
        });
    }else{
        return async (ctx, next)=>{
            await next();
        };
    }
};