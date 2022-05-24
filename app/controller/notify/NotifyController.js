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
const ServerController = require('../../controller/server/ServerController');
const NotifyService = require('../../service/notify/NotifyService');
const AuthService = require('../../service/auth/AuthService');

const NotifyController = {};
const util = require('../../../tools/util');

const serverNotifyStruct = {
	notifytime: {
		formatter: util.formatTimeStamp
	},
	server_id: '',
	thread_id: '',
	command: '',
	result: ''
};

const statusInfoStruct = {
	cpuUsed: {
		formatter: (value) => {
			return value.toFixed(2)
		}
	},
	loadAvg1: {
		formatter: (value) => {
			return value.toFixed(2)
		}
	},
	loadAvg5: {
		formatter: (value) => {
			return value.toFixed(2)
		}
	},
	loadAvg15: {
		formatter: (value) => {
			return value.toFixed(2)
		}
	},
	memUsed: {
		formatter: (value) => {
			return value.toFixed(2)
		}
	},
	memAvailable: {
		formatter: (value) => {
			return (value / 1000).toFixed(2)
		}
	},
	memAll: {
		formatter: (value) => {
			return (value / 1000).toFixed(2)
		}
	},
	nodeDiskUsed: {
		formatter: (value) => {
			return value.toFixed(2)
		}
	},
	nodeDiskAvailable: {
		formatter: (value) => {
			return (value / 1000).toFixed(2)
		}
	},
	nodeDiskAll: {
		formatter: (value) => {
			return (value / 1000).toFixed(2)
		}
	},
	rootDiskUsed: {
		formatter: (value) => {
			return value.toFixed(2)
		}
	},
	rootDiskAvailable: {
		formatter: (value) => {
			return (value / 1000).toFixed(2)
		}
	},
	rootDiskAll: {
		formatter: (value) => {
			return (value / 1000).toFixed(2)
		}
	}
}

NotifyController.getServerNotifyList = async (ctx) => {
	let treeNodeId = ctx.paramsObj.tree_node_id;
	let curPage = parseInt(ctx.paramsObj.curr_page) || 0;
	let pageSize = parseInt(ctx.paramsObj.page_size) || 0;
	try {
		let params = ServerController.formatTreeNodeId(treeNodeId);
		if (!await AuthService.hasDevAuth(params.application, params.serverName, ctx.uid)) {
			ctx.makeNotAuthResObj();
		} else {
			let rst = await NotifyService.getServerNotifyList(params, curPage, pageSize);
			ctx.makeResObj(200, '', {
				count: rst.count,
				rows: util.viewFilter(rst.rows, serverNotifyStruct)
			});
		}

	} catch (e) {
		logger.error('[getServerNotifyList]', e, ctx);
		ctx.makeErrResObj();
	}
};


//查询tarsnode服务实时状态
NotifyController.getServerNotifyListByServerName = async (ctx) => {
	let {
		application,
		serverName,
		node
	} = ctx.paramsObj;
	let curPage = parseInt(ctx.paramsObj.curr_page) || 0;
	let pageSize = parseInt(ctx.paramsObj.page_size) || 0;
	try {
		if (!await AuthService.hasOpeAuth(application, serverName, ctx.uid)) {
			ctx.makeNotAuthResObj();
		} else {
			params = {
				application,
				serverName,
				node,
				curPage,
				pageSize
			}
			let rst = await NotifyService.getServerNotifyListByServerName(params);
			ctx.makeResObj(200, '', {
				count: rst.count,
				rows: util.viewFilter(rst.rows, serverNotifyStruct)
			});
		}

	} catch (e) {
		logger.error('[getServerNotifyListByServerName]', e, ctx);
		ctx.makeErrResObj();
	}
};

/*获取某台服务器的基本负载情况*/
NotifyController.getMachineStatusInfo = async (ctx) => {
	let {
		node
	} = ctx.paramsObj;
	try {
		let rst = await NotifyService.getMachineStatusInfo(node);
		rst.statusInfo.memAll = rst.statusInfo.memAvailable / ((100 - rst.statusInfo.memUsed) / 100);
		rst.statusInfo.nodeDiskAll = rst.statusInfo.nodeDiskAvailable / ((100 - rst.statusInfo.nodeDiskUsed) / 100);
		rst.statusInfo.rootDiskAll = rst.statusInfo.rootDiskAvailable / ((100 - rst.statusInfo.rootDiskUsed) / 100);
		logger.info("nodeinfo:" + JSON.stringify(rst, null, 4));
		rst.statusInfo = util.viewFilter(rst.statusInfo, statusInfoStruct)
		ctx.makeResObj(200, '', rst);
	} catch (e) {
		logger.error('[getMachineStatusInfo]', e, ctx);
		ctx.makeResObj(500, e.message);
	}
};




module.exports = NotifyController;