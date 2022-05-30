const WebConf = require('../config/webConf');
const url = require('url');

let AuthService;

if (WebConf.isEnableK8s()) {
AuthService = require('../k8s/service/auth/AuthService');
} else {
AuthService = require('../app/service/auth/AuthService');
}


//admin用户才能访问
module.exports = async (ctx, next) => {

    var myurl = url.parse(ctx.url);

    if (myurl.pathname.indexOf('/pages/server/api/auth/page/') != -1 || myurl.pathname.indexOf('/base/gateway') != -1) {
        if (!await AuthService.isAdmin(ctx.uid)) {
            ctx.makeResObj(500, '#common.noPrivilage#', {});
            return;
        }
    }

    await next();
}