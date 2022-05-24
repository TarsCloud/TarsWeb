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

const WebConf = require('../config/webConf');

const {
	apiConf,
	clientConf
} = require('../app/index');
const {
	dcacheApiConf
} = require('../dcache');
const {
	ssoApiConf
} = require('../sso');
const {
	pageApiConf,
	localeApiConf,
	authApiConf,
	monitorApiConf,
	callTrainConf,
	infTestConf
} = require('../index');

const {
	marketApiConf
} = require('../market');


const Router = require('koa-router');
const _ = require('lodash');
const noCacheMidware = require('./noCacheMidware');
const authMidware = require('./authMidware');
const {
	paramsDealMidware,
	paramsCheckMidware
} = require('./paramsMidware');
// const logger = require('../logger');

//获取路由
const getRouter = (router, routerConf) => {

	routerConf.forEach(function (conf) {
		var [method, url, controller, checkRule, validParams] = conf;

		//前置参数合并校验相关中间件
		router[method](url, paramsDealMidware(validParams)); //上下文入参出参处理中间件
		router[method](url, paramsCheckMidware(checkRule)); //参数校验中间件

		router[method](url, authMidware); //admin用户采访访问的接口

		router[method](url, noCacheMidware); //禁用缓存中间件

		//业务逻辑控制器
		router[method](url, async (ctx, next) => {

			// console.log('call', url, controller);
			await controller.call({}, ctx);
			await next();

		});

	});
};

localeApiConf.forEach(conf => apiConf.push(conf));
authApiConf.forEach(conf => apiConf.push(conf));
dcacheApiConf.forEach(conf => apiConf.push(conf));
ssoApiConf.forEach(conf => apiConf.push(conf));
monitorApiConf.forEach(conf => apiConf.push(conf));
callTrainConf.forEach(conf => apiConf.push(conf));
infTestConf.forEach(conf => apiConf.push(conf));

marketApiConf.forEach(conf => apiConf.push(conf));

//页面类型路由
const pageRouter = new Router();
pageRouter.prefix('/web');
getRouter(pageRouter, pageApiConf);

const indexRouter = new Router();
indexRouter.prefix('/');
getRouter(indexRouter, pageApiConf);


//节点服务器过来的请求, 获取安装tarsnode的脚本
const clientRouter = new Router();
getRouter(clientRouter, clientConf);

//页面接口类型路由
const paegApiRouter = new Router();
paegApiRouter.prefix('/pages/server/api');
getRouter(paegApiRouter, apiConf);

//接口类型路由
const apiRouter = new Router();
apiRouter.prefix('/api');
getRouter(apiRouter, apiConf);

let k8sRouter = null;
let k8sApiRouter = null;
//激活router
if (WebConf.isEnableK8s()) {
	const {
		k8sApiConf
	} = require('../k8s');

	//k8s接口类型路由
	k8sRouter = new Router();
	k8sRouter.prefix('/pages/k8s/api');
	getRouter(k8sRouter, k8sApiConf);

	k8sApiRouter = new Router();
	k8sApiRouter.prefix('/k8s/api');
	getRouter(k8sApiRouter, k8sApiConf);
}

//market类型路由
const marketApiRouter = new Router();
marketApiRouter.prefix('/pages/market/api');
getRouter(marketApiRouter, marketApiConf);


module.exports = {
	indexRouter,
	pageRouter,
	paegApiRouter,
	clientRouter,
	apiRouter,
	k8sRouter,
	k8sApiRouter,
	marketApiRouter
};