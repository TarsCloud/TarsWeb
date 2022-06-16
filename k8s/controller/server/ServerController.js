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
const NodeService = require('../../service/node/NodeService');
const ServerService = require('../../service/server/ServerService');

const ServerController = {};

ServerController.formatTreeNodeId = (treeNodeId) => {
	let serverConf = {};
	treeNodeId = treeNodeId.split('.');
	treeNodeId.forEach((s) => {
		let i = parseInt(s.substring(0, 1));
		let v = s.substring(1);
		switch (i) {
			case 1:
				serverConf.application = v;
				break;
			case 2:
				serverConf.setName = v;
				serverConf.enableSet = 'Y';
				break;
			case 3:
				serverConf.setArea = v;
				serverConf.enableSet = 'Y';
				break;
			case 4:
				serverConf.setGroup = v;
				serverConf.enableSet = 'Y';
				break;
			case 5:
				serverConf.serverName = v;
				break;
			default:
				break;
		}
	});

	if (serverConf.setName || serverConf.setArea || typeof serverConf.setGroup != "undefined") {
		serverConf.enableSet = 'Y';
	}
	// 无set信息，且有app和servername信息时，说明是查询无set服务节点。此时要将enableSet设置为N，否则会把带set节点也查出来
	// 不能直接非Y就设置为N，否则根据application查询下面所有节点时，会查不到任何数据
	if (serverConf.enableSet != 'Y' && serverConf.application && serverConf.serverName) {
		serverConf.enableSet = 'N'
	}

	return serverConf;
};

ServerController.sendCommand = async (ctx) => {
	let params = ctx.paramsObj;
	let application = params.serverApp
	let serverName = params.serverName
	let podIp = params.podIp
	let command = params.command

	try {
		let ret
		switch (`${command}`) {
			case 'StartServer':
				ret = await NodeService.startServer(application, serverName, podIp);
				break;
			case 'StopServer':
				ret = await NodeService.stopServer(application, serverName, podIp);
				break;
			case 'RestartServer':
				ret = await NodeService.restartServer(application, serverName, podIp);
				break;
			default:
				ret = await NodeService.doCommand(application, serverName, podIp, command);
				break;
		}
		ctx.makeResObj(200, '', ret);
	} catch (e) {
		logger.error('[sendCommand]', e.body ? e.body.message : e, ctx)
		ctx.makeResObj(500, e.body ? e.body.message : e);
	}
}

/**
 * 服务列表
 */
ServerController.ServerSelect = async (ctx) => {
	let {
		Token = '', ServerApp = '', ServerName = '', page = 1, isAll, force = false
	} = ctx.paramsObj

	let pageIndex = Math.floor(page) || 1
	let pageSize = 10

	isAll = isAll == "true"

	let limiter = null
	if (!isAll) {
		limiter = {
			offset: (pageIndex - 1) * pageSize,
			rows: pageSize,
		}
	}

	try {

		let result = await ServerService.selectServer(ServerApp, ServerName, limiter, force);

		ctx.makeResObj(result.ret, "succ", result.data)
	} catch (e) {
		logger.error('[ServerSelect]', e.body ? e.body.message : e, ctx)
		ctx.makeResObj(500, e.body ? e.body.message : e);
	}
}

/**
 * 服务更新
 */
ServerController.ServerUpdate = async (ctx) => {
	let {
		Token = '', tree_node_id = '',
			ServerType = '', ServerMark = '',
	} = ctx.paramsObj
	const that = module.exports

	try {
		let serverData = ServerController.formatTreeNodeId(tree_node_id);

		const target = {
			ServerType,
			ServerMark,
		}

		let result = await ServerService.updateServer(serverData, target);

		ctx.makeResObj(result.ret, result.msg, result.data)
	} catch (e) {
		logger.error('[ServerUpdate]', e.body ? e.body.message : e, ctx)
		ctx.makeResObj(500, e.body ? e.body.message : e);
	}
}

/**
 * 服务下线
 */
ServerController.ServerUndeploy = async (ctx) => {
	let {
		Token = '', ServerIds = []
	} = ctx.paramsObj

	try {

		for (let i = 0; i < ServerIds.length; i++) {

			let serverData = {
				application: ServerIds[i].split(".")[0],
				serverName: ServerIds[i].split(".")[1],
			}

			let result = await ServerService.deleteServer(serverData);

			if (result.ret != 200) {
				ctx.makeResObj(result.ret, result.msg, result.data);
				return;
			}
		}

		ctx.makeResObj(200, "succ", {});
	} catch (e) {
		logger.error('[ServerUndeploy]', e.body ? e.body.message : e, ctx)
		ctx.makeResObj(500, e.body ? e.body.message : e);
	}
}

/**
 * 服务编辑列表
 */
ServerController.ServerOptionSelect = async (ctx) => {
	let {
		Token = '', tree_node_id = ''
	} = ctx.paramsObj


	let limiter = null;

	try {

		let serverData = ServerController.formatTreeNodeId(tree_node_id);
		let result = await ServerService.serverOptionSelect(serverData, limiter);
		ctx.makeResObj(result.ret, result.msg, result.data);

	} catch (e) {
		logger.error('[ServerOptionSelect]', e.body ? e.body.message : e, ctx)
		ctx.makeResObj(500, e.body ? e.body.message : e);
	}
};
/**
 * 服务编辑列表
 */
ServerController.ServerOptionUpdate = async (ctx) => {
	let {
		Token = '', tree_node_id = '',
			ServerImportant = 0, ServerTemplate = '', ServerProfile = '',
			AsyncThread = '',
	} = ctx.paramsObj

	if (AsyncThread === '') {
		AsyncThread = 3
	} else {
		AsyncThread = parseInt(AsyncThread)
	}

	try {
		let serverData = ServerController.formatTreeNodeId(tree_node_id);

		let target = {
			ServerTemplate,
			ServerProfile,
			AsyncThread,
			ServerImportant,
		}

		let result = await ServerService.serverOptionUpdate(serverData, target);
		ctx.makeResObj(result.ret, result.msg, result.data);

	} catch (e) {
		logger.error('[ServerOptionUpdate]', e.body ? e.body.message : e, ctx)
		ctx.makeResObj(500, e.body ? e.body.message : e);
	}
};
/**
 * 查看服务模版内容
 */
ServerController.ServerOptionTemplate = async (ctx) => {
	let {
		Token = '', tree_node_id = ''
	} = ctx.paramsObj

	try {
		let serverData = ServerController.formatTreeNodeId(tree_node_id);
		let result = await ServerService.serverOptionTemplate(serverData);
		ctx.makeResObj(result.ret, result.msg, result.data);

	} catch (e) {
		logger.error('[ServerOptionTemplate]', e.body ? e.body.message : e, ctx)
		ctx.makeResObj(500, e.body ? e.body.message : e);
	}
};

// /**
//  * 命令
//  */
// ServerController.Command = async (ctx) => {
// 	let {
// 		Token = '', command = '', server_ids = []
// 	} = ctx.paramsObj

// 	try {
// 		let ServerApp = '',
// 			ServerName = ''
// 		if (ServerId.indexOf('.') === -1) {
// 			ServerApp = ServerId
// 		} else {
// 			ServerApp = ServerId.substring(0, ServerId.indexOf('.'))
// 			ServerName = ServerId.substring(ServerId.indexOf('.') + 1, ServerId.length)
// 		}

// 		if (!ServerApp || !ServerName) {
// 			return ctx.makeResObj(500, 'ServerId Error')
// 		}

// 		const method = 'do'
// 		const action = {
// 			key: command,
// 			value: {
// 				ServerApp,
// 				ServerName,
// 				PodIps,
// 			},
// 		}

// 		const params = {
// 			kind: 'Command',
// 			token: Token,
// 			action,
// 		}
// 		let result = await ajax({
// 			method,
// 			params
// 		})
// 		if (result && result.ret === 0) {
// 			ctx.makeResObj(200, result.msg, result.data)
// 		} else {
// 			ctx.makeResObj(500, result.msg)
// 		}
// 	} catch (e) {
// 		logger.error('[Command]', e.body ? e.body.message : e, ctx)
// 		ctx.makeResObj(500, e.body ? e.body.message : e);
// 	}
// }

module.exports = ServerController;