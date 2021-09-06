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
// const CommonService = require('../../service/common/CommonService');
const NodeService = require('../../service/node/NodeService');
const ServerService = require('../../service/server/ServerService');
// const util = require('../../tools/util');

// const serverConfStruct = {
// 	id: '',
// 	application: '',
// 	server_name: '',
// 	node_name: '',
// 	server_type: '',
// 	enable_set: {
// 		formatter: (value) => {
// 			return value == 'Y' ? true : false;
// 		}
// 	},
// 	set_name: '',
// 	set_area: '',
// 	set_group: '',
// 	setting_state: '',
// 	present_state: '',
// 	bak_flag: {
// 		formatter: (value) => {
// 			return value == 0 ? false : true;
// 		}
// 	},
// 	template_name: '',
// 	profile: '',
// 	async_thread_num: '',
// 	base_path: '',
// 	exe_path: '',
// 	start_script_path: '',
// 	stop_script_path: '',
// 	monitor_script_path: '',
// 	patch_time: {formatter: util.formatTimeStamp},
// 	patch_version: "",
// 	process_id: '',
// 	posttime: {formatter: util.formatTimeStamp}
// };

const ServerController = {};

ServerController.sendCommand = async (ctx) => {
	let params = ctx.paramsObj;
	let application = params.serverApp
	let serverName = params.serverName
	let podIp = params.podIp
	let command = params.command

	try{
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
	}catch(e) {
		logger.error('[sendCommand]', e.body ? e.body.message : e, ctx)
		ctx.makeResObj(500, e.body ? e.body.message : e);
	}
}

// ServerController.getServerSearch = async (ctx) => {
//     let {searchkey} = ctx.paramsObj
//     try {
//         let currPage = parseInt(ctx.paramsObj.curr_page) || 0
//         let pageSize = parseInt(ctx.paramsObj.page_size) || 0
// 		let rst = await ServerService.searchServer(searchkey.trim());

// 		console.log(rst);

//         // let rows = util.viewFilter(ret.rows, serverConfStruct) || []

//         // rows.forEach(server => {
//         //     server.id = server.application + '.' + server.server_name;
//         // })
//         ctx.makeResObj(200, '', {
//             // count: ret.count,
// 			rows: rst.data
//         })
//     } catch (e) {
//         logger.error('[getServerSearch]', e, ctx);
//         ctx.makeErrResObj();
//     }
// }


/**
 * 服务列表
 */
ServerController.ServerSelect = async(ctx) => {
	let { Token = '', ServerApp = '', ServerName = '', page = 1 , isAll} = ctx.paramsObj

	let pageIndex = Math.floor(page) || 1
	let pageSize = 10

	isAll = isAll=="true"

	let limiter = null
	if (!isAll){
		limiter = {
			offset: (pageIndex - 1) * pageSize,
			rows: pageSize,
		}
	}

	try {

		let result = await ServerService.selectServer(ServerApp, ServerName, limiter);

		ctx.makeResObj(result.ret, "succ", result.data)
	} catch (e) {
		logger.error('[ServerSelect]', e.body ? e.body.message : e, ctx)
		ctx.makeResObj(500, e.body ? e.body.message : e);
	}
}

/**
 * 服务更新
 */
ServerController.ServerUpdate = async(ctx) => {
	let { Token = '', ServerId = '',
		ServerType = '', ServerMark = '',
	} = ctx.paramsObj
	const that = module.exports

	try {
		const metadata = {
			ServerId,
		}
		const target = {
			ServerType,
			ServerMark,
		}

		let result = await ServerService.updateServer(metadata, target);

		ctx.makeResObj(result.ret, result.msg, result.data)
	} catch (e) {
		logger.error('[ServerUpdate]', e.body ? e.body.message : e, ctx)
		ctx.makeResObj(500, e.body ? e.body.message : e);
	}
}

/**
 * 服务下线
 * @param  {Array}   ServerId             服务ID
 */
ServerController.ServerUndeploy = async (ctx) => {
	let { Token = '', ServerId = [] } = ctx.paramsObj

	try {
		const metadata = {
			ServerId,
		}

		let result = await ServerService.deleteServer(metadata);
		ctx.makeResObj(result.ret, result.msg, result.data)
	} catch (e) {
		logger.error('[ServerUndeploy]', e.body ? e.body.message : e, ctx)
		ctx.makeResObj(500, e.body ? e.body.message : e);
	}
}

/**
 * 服务编辑列表
 * @param  {String}  Token                登录签名
 * @param  {String}  ServerId             服务
 */
ServerController.ServerOptionSelect = async(ctx) => {
	const that = module.exports
	let { Token = '', ServerId = ''} = ctx.paramsObj


	let limiter = null;

	try {
		let result = await ServerService.serverOptionSelect(ServerId, limiter);
		ctx.makeResObj(result.ret, result.msg, result.data);

	} catch (e) {
		logger.error('[ServerOptionSelect]', e.body ? e.body.message : e, ctx)
		ctx.makeResObj(500, e.body ? e.body.message : e);
	}
},
	/**
	 * 服务编辑列表
	 * @param  {String}  Token                 登录签名
	 * @param  {Number}  ServerId              服务ID
	 * @param  {Number}  ServerImportant       服务等级
	 * @param  {String}  ServerTemplate        服务模版
	 * @param  {String}  ServerProfile         私有模版
	 * @param  {String}  StartScript           开始脚本路径
	 * @param  {String}  StopScript            停止脚本路径
	 * @param  {String}  MonitorScript         监控脚本路径
	 * @param  {Number}  AsyncThread           异步线程数
	 * @param  {Boolean} RemoteLogEnable       远程日志启用( true, false )
	 * @param  {Number}  RemoteLogReserveTime  远程日志保留时间
	 * @param  {Number}  RemoteLogCompressTIme 远程日志压缩时间
	 */
	ServerController.ServerOptionUpdate = async(ctx) => {
		const that = module.exports
		let { Token = '', ServerId = '',
			ServerImportant = 0, ServerTemplate = '', ServerProfile = '',
			AsyncThread = '',
		} = ctx.paramsObj

		if (AsyncThread === '') {
			AsyncThread = 3
		} else {
			AsyncThread = parseInt(AsyncThread)
		}

		try {
			const metadata = {
				ServerId,
			}
			let target = {
				ServerTemplate,
				ServerProfile,
				AsyncThread,
				ServerImportant,
			}

			let result = await ServerService.serverOptionUpdate(metadata, target);
			ctx.makeResObj(result.ret, result.msg, result.data);

		} catch (e) {
			logger.error('[ServerOptionUpdate]', e.body ? e.body.message : e, ctx)
			ctx.makeResObj(500, e.body ? e.body.message : e);
		}
	},
	/**
	 * 查看服务模版内容
	 * @param  {String}  Token                登录签名
	 * @param  {String}  ServerId             服务ID
	 */
	ServerController.ServerOptionTemplate = async(ctx) => {
		const that = module.exports
		let { Token = '', ServerId = '' } = ctx.paramsObj

		let metadata = {
			ServerId: ServerId
		}

		try {

			let result = await ServerService.serverOptionTemplate(metadata);
			ctx.makeResObj(result.ret, result.msg, result.data);

		} catch (e) {
			logger.error('[ServerOptionTemplate]', e.body ? e.body.message : e, ctx)
			ctx.makeResObj(500, e.body ? e.body.message : e);
		}
	},

	/**
	 * 命令
	 * @param  {String}  Token                登录签名
	 * @param  {String}  command              命令名称 (StartServer, StopServer)
	 * @param  {String}  server_ids           服务ID
	 */
	ServerController.Command = async (ctx) => {
		let { Token = '', command = '', server_ids = [] } = ctx.paramsObj

		try {
			let ServerApp = '', ServerName = ''
			if (ServerId.indexOf('.') === -1) {
				ServerApp = ServerId
			} else {
				ServerApp = ServerId.substring(0, ServerId.indexOf('.'))
				ServerName = ServerId.substring(ServerId.indexOf('.') + 1, ServerId.length)
			}

			if(!ServerApp || !ServerName){
				return ctx.makeResObj(500, 'ServerId Error')
			}

			const method = 'do'
			const action = {
				key: command,
				value: {
					ServerApp,
					ServerName,
					PodIps,
				},
			}

			const params = {
				kind: 'Command',
				token: Token,
				action,
			}
			let result = await ajax({ method, params })
			if(result && result.ret === 0){
				ctx.makeResObj(200, result.msg, result.data)
			}else{
				ctx.makeResObj(500, result.msg)
			}
		} catch (e) {
			logger.error('[Command]', e.body ? e.body.message : e, ctx)
			ctx.makeResObj(500, e.body ? e.body.message : e);
		}
	}

module.exports = ServerController;
