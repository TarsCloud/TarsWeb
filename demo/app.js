const Koa = require('koa');
const app = new Koa();
const path = require('path');
const url = require('url');
const views = require('koa-views');
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser');
const multer = require('koa-multer');
const static = require('koa-static');
const {pageRouter, apiRouter} = require('./app/router');
const preMidware = require('./app/midware/preMidware');
const postMidware = require('./app/midware/postMidware');
const localeMidware = require('./app/midware/localeMidware');
const helmet = require("koa-helmet");
// const compress = require('koa-compress')
const loginMidware = require('yami-sso-client').koa;
const AuthService = require('./app/service/auth/AuthService');
// const authMidware = require('./app/midware/authMidware');
const logger = require('./app/logger');

const upload = multer({dest: './uploads/'});

//信任proxy头部，支持 X-Forwarded-Host
app.proxy = true;

// error handler
onerror(app);

//安全防护
app.use(helmet());

//设置ejs模板
app.use(views(__dirname + '/views', {
    extension: 'ejs'
}));

app.use(bodyparser());

app.use(upload.single('suse'));

//国际化多语言中间件
app.use(localeMidware);

//前置中间件
preMidware.forEach((midware)=>{
    app.use(midware);
});

//登录校验
let loginConf = require('./config/loginConf.js');
loginConf.ignore =loginConf.ignore.concat(['/static', '/adminPass.html', '/api/adminModifyPass', '/login.html', '/register.html', '/favicon.ico', '/api/get_locale', '/api/login']);

//写入cookie的domain, 方便和web, cookie互通
if(process.env.COOKIE_DOMAIN) {
	loginConf.cookieDomain = process.env.COOKIE_DOMAIN;
}

app.use(async (ctx, next) => {

    //for tars cloud, prefix: TARS_WEB_SSO_PREFIX=auth, for example: xxx.test.tarsyun.com -> auth.xxx.test.tarsyun.com
    if (process.env.TARS_WEB_SSO_PREFIX) {

        let host = ctx.host.split(':')[0];

        loginConf.cookieDomain = host.substr(host.indexOf('.'));
    }

    //优先环境变量的host
    let userCenterHost = process.env.USER_CENTER_HOST || 'http://' + ctx.host;

    loginConf.loginUrl = loginConf.baseLoginUrl.replace("${user-center-host}", userCenterHost);

    logger.info('userCenterHost:', userCenterHost, 'host:', ctx.host, 'loginUrl:', loginConf.loginUrl);

    var myurl = url.parse(ctx.url);

    if (await AuthService.isInit()) {

        if ((myurl.pathname.lastIndexOf('.html') != -1 || myurl.pathname == '/') && myurl.pathname != '/adminPass.html') {

            logger.info(userCenterHost + '/adminPass.html?redirect_url=' + encodeURIComponent(ctx.url));
            ctx.redirect(userCenterHost + '/adminPass.html?redirect_url=' + encodeURIComponent(ctx.url));
            return;
        }

    } else if (myurl.pathname == '/adminPass.html') {
        logger.info(userCenterHost);

        ctx.redirect(userCenterHost);
        return;
    }

    await next();
})

app.use(loginMidware(loginConf));

//激活router
app.use(pageRouter.routes(), pageRouter.allowedMethods());
app.use(apiRouter.routes(), apiRouter.allowedMethods());

//激活静态资源中间件
app.use(static(path.join(__dirname, './client/dist'), {maxage: 7 * 24 * 60 * 60 * 1000}));

//后置中间件
postMidware.forEach((midware)=>{
    app.use(midware);
});

module.exports = app;