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
const ServerController = require('../../controller/server/ServerController');
const NotifyService = require('../../service/notify/NotifyService');
const AuthService = require('../../service/auth/AuthService');

const NotifyController = {};
const util = require('../../tools/util');

const serverNotifyStruct = {
	notifytime: {formatter: util.formatTimeStamp},
	server_id: '',
	thread_id: '',
	command: '',
	result: ''
};

NotifyController.getServerNotifyList = async (ctx) => {
	let treeNodeId = ctx.paramsObj.tree_node_id;
	let curPage = parseInt(ctx.paramsObj.curr_page) || 0;
	let pageSize = parseInt(ctx.paramsObj.page_size) || 0;
	try {
		let params = ServerController.formatTreeNodeId(treeNodeId);
		if (!await AuthService.hasOpeAuth(params.application, params.serverName, ctx.uid)) {
			ctx.makeNotAuthResObj();
		} else {
			let rst = await NotifyService.getServerNotifyList(params, curPage, pageSize);
			ctx.makeResObj(200, '', {count: rst.count, rows: util.viewFilter(rst.rows, serverNotifyStruct)});
		}

	} catch (e) {
		logger.error('[getServerNotifyList]', e, ctx);
		ctx.makeErrResObj();
	}
};


module.exports = NotifyController;