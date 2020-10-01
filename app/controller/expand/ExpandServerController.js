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
const ExpandService = require('../../service/expand/ExpandService');
const ServerService = require('../../service/server/ServerService');
const webConf = require('../../../config/webConf').webConf;
const util = require('../../tools/util');
const AuthService = require('../../service/auth/AuthService');

const expandStruct = {
	application: '',
	server_name: '',
	set: '',
	obj_name: '',
	node_name: '',
	bind_ip: '',
	port: '',
	template_name: '',
	status: '',
	auth: ''
};

const serverConfStruct = {
	id: '',
	application: '',
	server_name: '',
	node_name: '',
	server_type: '',
	enable_set: {
		formatter: (value) => {
			return value == 'Y' ? true : false;
		}
	},
	set_name: '',
	set_area: '',
	set_group: '',
	setting_state: '',
	present_state: '',
	bak_flag: {
		formatter: (value) => {
			return value == 0 ? false : true;
		}
	},
	template_name: '',
	profile: '',
	async_thread_num: '',
	base_path: '',
	exe_path: '',
	start_script_path: '',
	stop_script_path: '',
	monitor_script_path: '',
	patch_time: util.formatTimeStamp,
	patch_version: "",
	process_id: '',
	posttime: {formatter: util.formatTimeStamp}
};


const ExpandServerController = {};

ExpandServerController.selectAppServer = async (ctx) => {
	try {
		let params = ctx.paramsObj;
		let level = params.level;
		let application = params.application;
		let serverName = params.server_name;
		let set = params.set;
		let rst = [];
		let uid = ctx.uid;
		switch (parseInt(level)) {
			case 1:
				rst = await ExpandService.getApplication(uid);
				break;
			case 2:
				rst = await ExpandService.getServerName(application, uid);
				break;
			case 3:
				rst = await ExpandService.getSet(application, serverName);
				break;
			case 4:
				rst = await ExpandService.getNodeName(application, serverName, set);
				break;
			case 5:
				rst = await ExpandService.getObj(application, serverName, uid);
				break;
			default:
				break;
		}
		ctx.makeResObj(200, '', rst);
	} catch (e) {
		logger.error('[selectAppServer]', e, ctx);
		ctx.makeErrResObj();
	}
};

ExpandServerController.expandServerPreview = async (ctx) => {
	var params = ctx.paramsObj;

	if(webConf.strict && await ServerService.isDeployWithRegistry([params.expand_nodes])) {
		//tarsregistry节点上, 无法部署其他任何服务
		ctx.makeResObj(500, '#common.deploy#');
		return
	}

	try {
		if (!await AuthService.hasDevAuth(params.application, params.server_name, ctx.uid)) {
			ctx.makeNotAuthResObj();
		} else {
			let rst = await ExpandService.preview(params);
			ctx.makeResObj(200, '', util.viewFilter(rst, expandStruct));
		}
	} catch (e) {
		logger.error('[expandServerPreview]', e, ctx);
		ctx.makeErrResObj();
	}
};

ExpandServerController.expandServer = async (ctx) => {
	var params = ctx.paramsObj;
	if(webConf.strict && await ServerService.isDeployWithRegistry([params.expand_nodes])) {
		//tarsregistry节点上, 无法部署其他任何服务
		ctx.makeResObj(500, '#common.deploy#');
		return
	}

	try {
		if (!await AuthService.hasDevAuth(params.application, params.server_name, ctx.uid)) {
			ctx.makeNotAuthResObj();
		} else {
			let rst = await ExpandService.expand(params);
			// console.log(rst.server_conf);
			ctx.makeResObj(200, '', {

				// server_conf: util.viewFilter(rst.server_conf, serverConfStruct),
				tars_node_rst: rst.tars_node_rst
			});
		}
	} catch (e) {
		// console.log(e);
		logger.error('[expandServer]', e, ctx);
		ctx.makeErrResObj(500, e);
	}
};

module.exports = ExpandServerController;