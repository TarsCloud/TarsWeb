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
const views = require('koa-views');
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser');
const multer = require('koa-multer');
const static = require('koa-static');
const preMidware = require('./app/midware/preMidware');
const postMidware = require('./app/midware/postMidware');
const localeMidware = require('./app/midware/localeMidware');
const helmet = require("koa-helmet");
// const compress = require('koa-compress')
const loginMidware = require('yami-sso-client').koa;
const limitMidware = require('./app/midware/limitMidware');
const WebConf = require('./config/webConf');
// const Router = require('koa-router');
const staticRouter = require('koa-static-router');
const upload = multer({dest: WebConf.pkgUploadPath.path + '/'});
const logger = require('./app/logger');

//信任proxy头部，支持 X-Forwarded-Host
app.proxy = true;

// error handler
onerror(app);

//防洪水攻击
app.use(limitMidware());

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
loginConf.ignore = loginConf.ignore.concat(['/web_version','/static', '/files', '/get_tarsnode', '/install.sh', '/favicon.ico', '/pages/server/api/get_locale']);

//上传文件不需要登录
if(WebConf.webConf.uploadLogin || process.env.TARS_WEB_UPLOAD == 'true') {
	loginConf.ignore.push('/pages/server/api/upload_patch_package');
	loginConf.ignore.push('/pages/server/api/upload_and_publish');
}

//web和demo的cookie写在同一个域名下
if(process.env.COOKIE_DOMAIN) {
	loginConf.cookieDomain = process.env.COOKIE_DOMAIN
}

if(process.env.USER_CENTER_HOST) {
	//存在外部host, 使用外部host代替 
	loginConf.userCenterUrl = process.env.USER_CENTER_HOST;
} 

loginConf.loginUrl = loginConf.baseLoginUrl.replace("http://localhost:3001", loginConf.userCenterUrl);

logger.info('loginUrl:', loginConf.loginUrl, 'userCenterUrl:', loginConf.userCenterUrl, 'cookieDomain', loginConf.cookieDomain);

app.use(async (ctx, next) => {
	// logger.info('loginUrl:', loginConf.loginUrl, 'userCenterUrl:', loginConf.userCenterUrl, 'cookieDomain', loginConf.cookieDomain);
	if(!process.env.USER_CENTER_HOST) {
		//直接用当前host代替, 端口还是保留
		let userCenterIp = ctx.host.split(':')[0];

		loginConf.userCenterUrl = loginConf.baseUserCenterUrl.replace("localhost", userCenterIp);

		loginConf.loginUrl = loginConf.baseLoginUrl.replace("localhost", userCenterIp);

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

let dcacheConf = require('./config/dcacheConf.js');
if (dcacheConf.enableDcache) {
	app.use(async (ctx, next) => {
		await next();
		ctx.cookies.set('dcache', 'true', {httpOnly: false});
	});
	//  tars-dcache 的包，依赖了很多tars的模块，引用路径是从根目录开始的，防止引用出错，先改后更
	let cwd = process.cwd();
	process.chdir(path.join(__dirname, './'));
	let tarsDcache = require('@tars/dcache');
	process.chdir(cwd);
} else {
	app.use(async (ctx, next) => {
		await next();
		ctx.cookies.set('dcache', 'false', {httpOnly: false});
	})
}

//激活router
// dcache 会添加新的 page、api router， 不能提前
const {pageRouter, apiRouter, clientRouter} = require('./app/router');
app.use(pageRouter.routes(), pageRouter.allowedMethods());
app.use(apiRouter.routes(), apiRouter.allowedMethods());
app.use(clientRouter.routes(), clientRouter.allowedMethods());

//激活静态资源中间件
app.use(static(path.join(__dirname, './client/dist'), {maxage: 7 * 24 * 60 * 60 * 1000}));

//后置中间件
postMidware.forEach((midware) => {
	app.use(midware);
});
//
module.exports = app;

