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
const ResourceService = require('../../service/resource/ResourceService');
const AdminService = require('../../service/admin/AdminService');
const _ = require('lodash');
const util = require('../../tools/util');
const send = require('koa-send');


const ResourceController = {};

ResourceController.listTarsNode = async(ctx) => {
	let curPage = parseInt(ctx.paramsObj.curr_page) || 0;
	let pageSize = parseInt(ctx.paramsObj.page_size) || 0;
	let nodeName = ctx.paramsObj.node_name || '';
	try {
		let rst = await ResourceService.listTarsNode(nodeName, curPage, pageSize);
		ctx.makeResObj(200, '', rst);
	} catch (e) {
		logger.error('[listTarsNode]', e, ctx);
		ctx.makeErrResObj();
	}
}

ResourceController.installTarsNode = async (ctx) => {
	try {
		// let ips = ctx.paramsObj.node_name;
		ctx.paramsObj.ips = _.trim(ctx.paramsObj.node_name, /;|,/).split(';');
		let rst = await ResourceService.installTarsNodes(ctx.paramsObj);
		ctx.makeResObj(200, '', rst);
	} catch (e) {
		logger.error('[installTarsNode]', e, ctx);
		ctx.makeErrResObj();
	}
};

ResourceController.uninstallTarsNode = async (ctx) => {
	try {
		let ips = ctx.paramsObj.ips;
		ips = _.trim(ips, /;|,/).split(';');
		let rst = await ResourceService.uninstallTarsNode(ips);
		ctx.makeResObj(200, '', rst);
	} catch (e) {
		logger.error('[installTarsNode]', e, ctx);
		ctx.makeErrResObj();
	}
};

module.exports = ResourceController;