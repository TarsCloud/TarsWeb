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

const logger = require('../../../logger');
const AuthService = require('../../service/auth/AuthService');
const FrameworkService = require('../../service/framework/FrameworkService');
const sm2 = require('miniprogram-sm-crypto').sm2

const FrameworkController = {};

FrameworkController.getFrameworkCUid = async (ctx) => {
	try {
		let data = await FrameworkService.getFrameworkKey();

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

FrameworkController.getFrameworkTicket = async (ctx) => {
	try {
		let data = await FrameworkService.getFrameworkKey();

		if (!data) {
			ctx.makeErrResObj();
			return;
		}
		const cipherMode = 1;

		//使用私钥解密
		let secret = ctx.paramsObj.secret;
		let ticket = sm2.doDecrypt(secret, data.pri_key, cipherMode);

		// console.log(data.pri_key);
		// console.log('encryptData', secret);
		// console.log('ticket', ticket);
		ctx.makeResObj(200, '', {
			ticket: ticket || ''
		});

	} catch (e) {
		logger.error('[getFrameworkTicket]', e, ctx);
		ctx.makeErrResObj();
	}
}

FrameworkController.updateFrameworkKey = async (ctx) => {
	let priKey = ctx.paramsObj.priKey;
	let cuid = ctx.paramsObj.cuid;
	try {
		if (!await AuthService.hasAdminAuth(ctx.uid)) {
			ctx.makeNotAuthResObj();
		} else {

			let data = await FrameworkService.getFrameworkKey();
			if (data) {

				logger.error('[updateFrameworkId] getFrameworkId fid exists:', data);

				ctx.makeErrResObj();
				return;
			}

			await FrameworkService.updateFrameworkKey(cuid, priKey);

			ctx.makeResObj(200, '', {});
		}
	} catch (e) {
		logger.error('[updateFrameworkKey]', e, ctx);
		ctx.makeErrResObj();
	}
};

FrameworkController.updateFrameworkAutoLogin = async (ctx) => {

	try {
		let autologin = ctx.paramsObj.autologin ? 1 : 0;

		console.log(typeof (ctx.paramsObj.autologin), autologin);
		if (!await AuthService.hasAdminAuth(ctx.uid)) {
			ctx.makeNotAuthResObj();
		} else {

			await FrameworkService.updateFrameworkAutoLogin(autologin);

			ctx.makeResObj(200, '', {});
		}
	} catch (e) {
		logger.error('[updateFrameworkAutoLogin]', e, ctx);
		ctx.makeErrResObj();
	}
};


module.exports = FrameworkController;