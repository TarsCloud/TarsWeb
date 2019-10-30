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
const _ = require('lodash');
const util = require('../../tools/util');
const AuthService = require('../../service/auth/AuthService');
const authConf = require('../../../config/authConf');

const AuthController = {};

AuthController.isEnableAuth = async (ctx) => {
	try {
		//只有admin用户可以分配权限
		// if("admin" == ctx.uid){
		// 	authConf.enableAuth = true;
		// }
		// else{
		// 	authConf.enableAuth = false;
		// }
		ctx.makeResObj(200, '', {enableAuth: authConf.enableAuth});
	} catch (e) {
		logger.error('[isEnableAuth]', e, ctx);
		ctx.makeErrResObj();
	}
};

AuthController.hasAuth = async (ctx) => {
	try {
		let application = ctx.paramsObj.application;
		let serverName = ctx.paramsObj.server_name;
		let role = ctx.paramsObj.role;
		let func = '';
		switch (role) {
			case 'developer':
				func = AuthService.hasDevAuth;
				break;
			case 'operator':
				func = AuthService.hasOpeAuth;
				break;
			default:
				func = AuthService.hasAdminAuth;
				break;
		}
		ctx.makeResObj(200, '', {has_auth: await func(application, serverName, ctx.uid)});
	} catch (e) {
		logger.error('[isEnableAuth]', e, ctx);
		ctx.makeErrResObj();
	}
};

AuthController.getAuthList = async (ctx) => {
	try {
		let application = ctx.paramsObj.application;
		let serverName = ctx.paramsObj.server_name;
		let rst = await AuthService.getAuthList(application, serverName);
		ctx.makeResObj(200, '', rst);
	} catch (e) {
		logger.error('[getUidList]', e, ctx);
		ctx.makeErrResObj();
	}
};

AuthController.updateAuth = async (ctx) => {
	try {
		let application = ctx.paramsObj.application;
		let serverName = ctx.paramsObj.server_name;
		let operator = ctx.paramsObj.operator || '';
		let developer = ctx.paramsObj.developer || '';
		await AuthService.updateAuth(application, serverName, operator, developer);
		ctx.makeResObj(200, '', {});
	} catch (e) {
		logger.error('[getUidList]', e, ctx);
		ctx.makeErrResObj();
	}
};

module.exports = AuthController;