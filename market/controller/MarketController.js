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
const WebConf = require('../../config/webConf');
const sm2 = require('miniprogram-sm-crypto').sm2

let AuthService;

if (WebConf.isEnableK8s()) {
	AuthService = require('../../k8s/service/auth/AuthService');
} else {
	AuthService = require('../../app/service/auth/AuthService');
}

let getMarketService = (k8s) => {
	if (WebConf.isEnableK8s() && (k8s == true || k8s == "true")) {
		return require('../service/MarketK8SService');
	} else {
		return require('../service/MarketService');
	}
}
const MarketController = {};

MarketController.listInstall = async (ctx) => {

	try {
		let result = await getMarketService(ctx.paramsObj.k8s).listInstall(ctx.paramsObj.product == 'true');

		ctx.makeResObj(result.ret, result.msg, result.data);

	} catch (e) {
		logger.error('[listInstall]', e.body ? e.body.message : e, ctx)
		ctx.makeResObj(500, e.body ? e.body.message : e);
	}
}

MarketController.get = async (ctx) => {

	try {
		let result = await getMarketService(ctx.paramsObj.k8s).get(ctx.paramsObj.app, ctx.paramsObj.server);

		ctx.makeResObj(result.ret, result.msg, result.data);

	} catch (e) {
		logger.error('[get]', e.body ? e.body.message : e, ctx)
		ctx.makeResObj(500, e.body ? e.body.message : e);
	}
}

MarketController.uninstallServer = async (ctx) => {

	try {
		let result = await getMarketService(ctx.paramsObj.k8s).uninstallServer(ctx.paramsObj.app, ctx.paramsObj.server, ctx.uid);

		ctx.makeResObj(result.ret, result.msg, result.data);

	} catch (e) {
		logger.error('[uninstallServer]', e.body ? e.body.message : e, ctx)
		ctx.makeResObj(500, e.body ? e.body.message : e);
	}
}

MarketController.uninstallProduct = async (ctx) => {

	try {
		let result = await getMarketService(ctx.paramsObj.k8s).uninstallProduct(ctx.paramsObj.servers, ctx.uid);

		ctx.makeResObj(result.ret, result.msg, result.data);

	} catch (e) {
		logger.error('[uninstallProduct]', e.body ? e.body.message : e, ctx)
		ctx.makeResObj(500, e.body ? e.body.message : e);
	}
}


MarketController.getFrameworkCUid = async (ctx) => {
	try {
		let data = await getMarketService(ctx.paramsObj.k8s).getFrameworkKey();

		// console.log(data);
		if (data) {
			ctx.makeResObj(200, '', {
				has: true,
				cuid: data.cuid,
				autologin: data.autologin,
			});
		} else {
			ctx.makeResObj(200, '', {
				has: false
			});
		}
	} catch (e) {
		logger.error('[getFrameworkKey]', e, ctx);
		ctx.makeErrResObj();
	}
};

MarketController.getFrameworkTicket = async (ctx) => {
	try {
		let data = await getMarketService(ctx.paramsObj.k8s).getFrameworkKey();

		console.log("getFrameworkTicket", data);

		if (!data) {
			ctx.makeErrResObj();
			return;
		}
		const cipherMode = 1;

		//使用私钥解密
		let secret = ctx.paramsObj.secret;
		let ticket = sm2.doDecrypt(secret, data.pri_key, cipherMode);

		console.log("ticket", secret, data.pri_key, ticket);

		ctx.makeResObj(200, '', {
			ticket: ticket || ''
		});

	} catch (e) {
		logger.error('[getFrameworkTicket]', e, ctx);
		ctx.makeErrResObj();
	}
}

MarketController.updateFrameworkKey = async (ctx) => {
	let priKey = ctx.paramsObj.priKey;
	let cuid = ctx.paramsObj.cuid;
	try {

		let data = await getMarketService(ctx.paramsObj.k8s).getFrameworkKey();
		if (data) {

			logger.error('[updateFrameworkId] getFrameworkId fid exists:', data);

			ctx.makeErrResObj();
			return;
		}
		if (!await AuthService.hasAdminAuth(ctx.uid)) {
			ctx.makeNotAuthResObj();
		} else {

			await getMarketService(ctx.paramsObj.k8s).updateFrameworkKey(cuid, priKey);
		}

		ctx.makeResObj(200, '', {});
	} catch (e) {
		logger.error('[updateFrameworkKey]', e, ctx);
		ctx.makeErrResObj();
	}
};

MarketController.updateFrameworkAutoLogin = async (ctx) => {

	try {
		let autologin = ctx.paramsObj.autologin ? 1 : 0;

		if (!await AuthService.hasAdminAuth(ctx.uid)) {
			ctx.makeNotAuthResObj();
		} else {

			await getMarketService(ctx.paramsObj.k8s).updateFrameworkAutoLogin(autologin);

			ctx.makeResObj(200, '', {});
		}
	} catch (e) {
		logger.error('[updateFrameworkAutoLogin]', e, ctx);
		ctx.makeErrResObj();
	}
};

module.exports = MarketController;