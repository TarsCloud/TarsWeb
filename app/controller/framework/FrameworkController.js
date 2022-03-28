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

const FrameworkController = {};

FrameworkController.getFrameworkId = async (ctx) => {
	try {
		if (!await AuthService.hasAdminAuth(ctx.uid)) {
			ctx.makeNotAuthResObj();
		} else {

			let data = await FrameworkService.getFrameworkId();

			if (data) {
				ctx.makeResObj(200, '', {
					fId: data.fId
				});
			} else {
				ctx.makeResObj(200, '', {
					fId: ''
				});
			}
		}
	} catch (e) {
		logger.error('[getFrameworkId]', e, ctx);
		ctx.makeErrResObj();
	}
};

FrameworkController.updateFrameworkId = async (ctx) => {
	let fId = ctx.paramsObj.fId;
	try {
		if (!await AuthService.hasAdminAuth(ctx.uid)) {
			ctx.makeNotAuthResObj();
		} else {

			let data = await FrameworkService.getFrameworkId();
			if (data) {

				logger.error('[updateFrameworkId] getFrameworkId fid exists:', data);

				ctx.makeErrResObj();
				return;
			}

			await FrameworkService.updateFrameworkId(fId);

			ctx.makeResObj(200, '', {});
		}
	} catch (e) {
		logger.error('[updateFrameworkId]', e, ctx);
		ctx.makeErrResObj();
	}
};

module.exports = FrameworkController;