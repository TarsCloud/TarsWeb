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

const logger = require('../../logger');
const AdminService = require('../../app/service/admin/AdminService')
const jsYaml = require('js-yaml');

const WebConf = require('../../config/webConf');

let AuthService;

if (WebConf.isEnableK8s()) {
	AuthService = require('../../k8s/service/auth/AuthService');
} else {
	AuthService = require('../../app/service/auth/AuthService');
}

let getMarketService = (k8s) => {
	console.log('getMarketService', k8s);
	if (k8s == "true") {
		return require('../service/MarketK8SService');
	} else {
		return require('../service/MarketService');
	}
}
const MarketController = {};

MarketController.install = async (ctx) => {

	try {
		let y = jsYaml.load(ctx.paramsObj.deploy);

		y.uid = ctx.uid;

		let result = await getMarketService(ctx.paramsObj.k8s).install(y, ctx.paramsObj);

		ctx.makeResObj(result.ret, result.msg, result.data);

	} catch (e) {
		logger.error('[install]', e.body ? e.body.message : e, ctx)
		ctx.makeResObj(500, e.body ? e.body.message : e);
	}
}

MarketController.listInstall = async (ctx) => {

	try {
		let result = await getMarketService(ctx.paramsObj.k8s).listInstall();

		ctx.makeResObj(result.ret, result.msg, result.data);

	} catch (e) {
		logger.error('[listFromCloud]', e.body ? e.body.message : e, ctx)
		ctx.makeResObj(500, e.body ? e.body.message : e);
	}
}

MarketController.get = async (ctx) => {

	try {
		let result = await getMarketService(ctx.paramsObj.k8s).get(ctx.paramsObj.app, ctx.paramsObj.server);

		ctx.makeResObj(result.ret, result.msg, result.data);

	} catch (e) {
		logger.error('[upgrade]', e.body ? e.body.message : e, ctx)
		ctx.makeResObj(500, e.body ? e.body.message : e);
	}
}

MarketController.upgrade = async (ctx) => {

	try {
		let y = jsYaml.load(ctx.paramsObj.deploy);

		y.uid = ctx.uid;

		let result = await getMarketService(ctx.paramsObj.k8s).upgrade(y, ctx.paramsObj);

		ctx.makeResObj(result.ret, result.msg, result.data);

	} catch (e) {
		logger.error('[upgrade]', e.body ? e.body.message : e, ctx)
		ctx.makeResObj(500, e.body ? e.body.message : e);
	}
}

module.exports = MarketController;