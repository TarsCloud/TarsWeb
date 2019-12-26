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
// const AdminService = require('../../service/admin/AdminService');
const _ = require('lodash');
const path = require('path');
// const util = require('../../tools/util');
// const send = require('koa-send');
var fs = require('fs');


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

ResourceController.connectTarsNode = async (ctx) => {
	try {
		let rst = await ResourceService.connectTarsNode(ctx.paramsObj);

		// console.log(rst);
		ctx.makeResObj(200, '', rst);
	} catch (e) {
		logger.error('[connectTarsNode]', e, ctx);
		ctx.makeErrResObj();
	}
}; 

ResourceController.installTarsNodes = async (ctx) => {
	try {
		let tgzPath = path.join(__dirname, '../../../files/tarsnode.tgz');
		let exists = fs.existsSync(tgzPath);
		if(!exists) {
			ctx.makeResObj(500, '#connectNodeList.installTgzNotExists#');
			return
		}

		// let ips = ctx.paramsObj.node_name;
		ctx.paramsObj.ips = _.trim(ctx.paramsObj.node_name, /;|,/).split(/[,;\n]/);
		let rst = await ResourceService.installTarsNodes(ctx.paramsObj);
		ctx.makeResObj(200, '', rst);
	} catch (e) {
		logger.error('[installTarsNode]', e, ctx);
		ctx.makeErrResObj();
	}
};

ResourceController.uninstallTarsNodes = async (ctx) => {
	try {
		let ips = ctx.paramsObj.ips;
		ips = _.trim(ips, /;|,/).split(/[,;\n]/);
		let rst = await ResourceService.uninstallTarsNodes(ips);
		ctx.makeResObj(200, '', rst);
	} catch (e) {
		logger.error('[installTarsNode]', e, ctx);
		ctx.makeErrResObj();
	}
};

ResourceController.getTarsNode = async(ctx) => {
	console.log('getTarsNode', ctx.paramsObj);

	let tgzPath = path.join(__dirname, '../../../files/tarsnode.tgz');
	let exists = fs.existsSync(tgzPath);
	if(!exists) {
		ctx.body = "#!/bin/bash \n echo 'not tarsnode.tgz exists'";
	}

	ctx.paramsObj.ip = ctx.paramsObj.ip || ctx.req.headers['x-forwarded-for'] || ctx.req.connection.remoteAddress || ctx.req.socket.remoteAddress || ctx.req.connection.socket.remoteAddress;

	let rst = await ResourceService.getTarsNode(ctx.paramsObj);

	ctx.body = rst;
}

module.exports = ResourceController;