// const authConf = require('../../config/authConf');
// const _ = require('lodash');

const AuthService = require('../service/auth/AuthService');

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

//只有一个用户, 且密码为空, 则跳转到修改Admin密码
module.exports = async(ctx, next) =>{
    // console.log('authMidware', ctx);

    // if(ctx.url.lastIndexOf('.html') != -1 && await AuthService.isInit() && ctx.url != '/adminPass.html') {
    //     ctx.redirect('/adminPass.html');
    //     return;
    // }

    await next();
}