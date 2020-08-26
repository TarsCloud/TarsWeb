
const AuthService = require('../service/auth/AuthService');
const url = require('url');

//admin用户才能访问
module.exports = async (ctx, next) => {

    var myurl = url.parse(ctx.url);

    if (myurl.pathname.indexOf('/pages/server/api/auth/page/') != -1) {
        if (!await AuthService.isAdmin(ctx.uid)) {
            ctx.makeResObj(500, '#common.noPrivilage#', {});
            return;
        }
    }

    await next();
}