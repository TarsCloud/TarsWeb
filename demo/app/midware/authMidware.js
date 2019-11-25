// const authConf = require('../../config/authConf');
// const _ = require('lodash');

const AuthService = require('../service/auth/AuthService');
const url = require('url');

// let isInWhiteIps = (ctx) => {
//     let ip = ctx.ip;
//     return _.indexOf(authConf.whiteIps, ip) > -1;
// };

// let hasAuth = (uid)=> {
//     let admin = authConf.admin || [];
//     return _.indexOf(admin, uid) > -1;
// };

// module.exports = async(ctx, next)=> {
//     if ( (ctx.url.indexOf('/api/auth') > -1) && !isInWhiteIps(ctx) && !hasAuth(ctx.uid)) {
//         ctx.makeNotAuthResObj();
//     } else {
//         await next();
//     }
// };

//admin用户才能访问
module.exports = async(ctx, next) =>{

    var myurl = url.parse(ctx.url);

    // console.log('authMidware', ctx, myurl);

    if(myurl.pathname.indexOf('/api/auth/page/') == 0) {
        if(!await AuthService.isAdmin(ctx.uid)) {
            ctx.makeResObj(500, '#common.noPrivilage#', {});
            return;
        }
    }

    await next();
}