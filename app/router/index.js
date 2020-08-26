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

const {pageConf, apiConf, clientConf, demoConf} = require('./routerConf');
const Router = require('koa-router');
const _ = require('lodash');
const noCacheMidware = require('../midware/noCacheMidware');
const authMidware = require('../midware/authMidware');
const {paramsDealMidware, paramsCheckMidware} = require('../midware/paramsMidware');
const gatewayDaoMidware = require('../midware/gatewayDaoMidware');

//获取路由
const getRouter = (router, routerConf) => {
	routerConf.forEach(function (conf) {
		var [method, url, controller, checkRule, validParams] = conf;

		//前置参数合并校验相关中间件
		router[method](url, paramsDealMidware(validParams));    //上下文入参出参处理中间件
		router[method](url, paramsCheckMidware(checkRule));   //参数校验中间件

		router[method](url, authMidware);    		//admin用户采访访问的接口

		router[method](url, noCacheMidware);       //禁用缓存中间件
		router[method](url, gatewayDaoMidware);	   //网关配置db获取中间件，非网关路由不做任何事情

		//业务逻辑控制器
		router[method](url, async (ctx, next) => {
			
			await controller.call({}, ctx);
			await next();
		});

	});
};

//页面类型路由
const pageRouter = new Router();
getRouter(pageRouter, pageConf);

//页面接口类型路由
const paegApiRouter = new Router();
paegApiRouter.prefix('/pages/server/api');
getRouter(paegApiRouter, apiConf);

//节点服务器过来的请求, 获取安装tarsnode的脚本
const clientRouter = new Router();
getRouter(clientRouter, clientConf);

//接口类型路由
const apiRouter = new Router();
apiRouter.prefix('/api');
getRouter(apiRouter, apiConf);

module.exports = {pageRouter, paegApiRouter, clientRouter, apiRouter};