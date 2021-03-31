/**
 * Tencent is pleased to support the open source community by making Tars available.
 *
 * Copyright (C) 2016THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the BSD 3-Clause License (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * https://opensource.org/licenses/BSD-3-Clause
 *
 * Unless required by applicable law or agreed to in writing, software distributed
 * under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

const Koa = require('koa');
const app = new Koa();
const path = require('path');
const url = require('url');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser');
const session = require('koa-session');
const multer = require('koa-multer');
const static = require('koa-static');
const apiMidware = require('./app/midware/apiMidware');
const preMidware = require('./app/midware/preMidware');
const postMidware = require('./app/midware/postMidware');
const localeMidware = require('./app/midware/localeMidware');
const helmet = require("koa-helmet");
const loginMidware = require('./app/midware/ssoMidware');
const limitMidware = require('./app/midware/limitMidware');
const WebConf = require('./config/webConf');
const staticRouter = require('koa-static-router');
const upload = multer({dest: WebConf.pkgUploadPath.path + '/'});
const logger = require('./app/logger');
const AuthService = require('./sso/app/service/auth/AuthService');

//信任proxy头部，支持 X-Forwarded-Host
app.proxy = true;

// error handler
onerror(app);

//防洪水攻击
app.use(limitMidware());

//验证码
const CONFIG = {
	key: 'koa:sess',
	maxAge: 1000 * 60 * 60 * 12, // 12小时, 设置 session 的有效时间，单位毫秒
	autoCommit: true, 
	overwrite: true,
	httpOnly: true,
	signed: true,
	rolling: false,
	renew: false,
}
app.keys = ['sessionCaptcha']
app.use(session(CONFIG, app))

//安全防护
app.use(helmet());

app.use(bodyparser());

app.use(upload.array('suse',5)); //这里决定了上传包的name只能叫suse。

//国际化多语言中间件
app.use(localeMidware);

//前置中间件
preMidware.forEach((midware) => {
	app.use(midware);
});

//登录校验
let loginConf = require('./config/loginConf.js');
loginConf.ignore = loginConf.ignore.concat(['/web_version', '/static', '/captcha', '/files', '/get_tarsnode', '/install.sh', '/favicon.ico', '/pages/server/api/get_locale']);
loginConf.ignore = loginConf.ignore.concat(['/adminPass.html', '/login.html', '/register.html', '/pages/server/api/adminModifyPass', '/pages/server/api/get_locale', '/pages/server/api/login']);

//上传文件不需要登录
if(WebConf.webConf.uploadLogin || process.env.TARS_WEB_UPLOAD == 'true') {
	loginConf.ignore.push('/pages/server/api/upload_patch_package');
	loginConf.ignore.push('/api/upload_patch_package');
	loginConf.ignore.push('/pages/server/api/upload_and_publish');
	loginConf.ignore.push('/api/upload_and_publish');
}

//不需要登录, 环境变量优先
if (process.env.TARS_ENABLE_LOGIN == "false") {
	loginConf.enableLogin = false;
}

//web和demo的cookie写在同一个域名下
if(process.env.COOKIE_DOMAIN) {
	loginConf.cookieDomain = process.env.COOKIE_DOMAIN
}

app.use(async (ctx, next) => {
	var myurl = url.parse(ctx.url);

	if (await AuthService.isInit()) {

		if ((myurl.pathname.lastIndexOf('.html') != -1 || myurl.pathname == '/') && myurl.pathname != '/adminPass.html') {

			logger.info('/adminPass.html?redirect_url=' + encodeURIComponent(ctx.url));
			ctx.redirect('/adminPass.html?redirect_url=' + encodeURIComponent(ctx.url));
			return;
		}

	} else if (myurl.pathname == '/adminPass.html') {

		ctx.redirect(myurl.pathname);
		return;
	}

	await next();
  });

app.use(loginMidware(loginConf));

//安装包资源中间件
app.use(staticRouter([
    {
    dir: './files',     //静态资源目录对于相对入口文件index.js的路径
    router: '/files'    //路由命名
}]));

//激活router

let dcacheConf = require('./config/dcacheConf.js');
if (dcacheConf.enableDcache) {
	app.use(async (ctx, next) => {
		await next();
		ctx.cookies.set('dcache', 'true', {httpOnly: false});
	});
	require('./dcache');
} else {
	app.use(async (ctx, next) => {
		await next();
		ctx.cookies.set('dcache', 'false', {httpOnly: false});
	})
}

require('./sso');

//激活router
// dcache 会添加新的 page、api router， 不能提前
const { pageRouter, paegApiRouter, clientRouter, apiRouter} = require('./app/router');

// app.use(apiMidware(apiRouter));

app.use(pageRouter.routes(), pageRouter.allowedMethods());
app.use(paegApiRouter.routes(), paegApiRouter.allowedMethods());
app.use(clientRouter.routes(), clientRouter.allowedMethods());
app.use(apiRouter.routes(), apiRouter.allowedMethods());

//激活静态资源中间件
app.use(static(path.join(__dirname, './client/dist'), {maxage: 7 * 24 * 60 * 60 * 1000}));

//后置中间件
postMidware.forEach((midware) => {
	app.use(midware);
});
//
module.exports = app;

