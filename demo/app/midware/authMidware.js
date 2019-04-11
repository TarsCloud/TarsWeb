const authConf = require('../../config/authConf');
const _ = require('lodash');

let isInWhiteIps = (ctx) => {
    let ip = ctx.ip;
    return _.indexOf(authConf.whiteIps, ip) > -1;
};

let hasAuth = (uid)=> {
    let admin = authConf.admin || [];
    return _.indexOf(admin, uid) > -1;
};

module.exports = async(ctx, next)=> {
    if ( (ctx.url.indexOf('/api/auth') > -1) && !isInWhiteIps(ctx) && !hasAuth(ctx.uid)) {
        ctx.makeNotAuthResObj();
    } else {
        await next();
    }
};

