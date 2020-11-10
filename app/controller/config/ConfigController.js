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
const ConfigService = require('../../service/config/ConfigService');
const AdminService = require('../../service/admin/AdminService');

const util = require('../../tools/util');

const ConfigController = {};

const configListStruct = {
	id: '',
	server_name: '',
	set_name: '',
	set_area: '',
	host: {key: 'node_name'},
	set_group: '',
	filename: '',
	config: '',
	level: '',
	posttime: {formatter: util.formatTimeStamp},
	lastuser: ''
};

const AuthService = require('../../service/auth/AuthService');

ConfigController.getUnusedApplicationConfigFile = async (ctx) => {
	let {config_id, application} = ctx.paramsObj;
	try {
		ctx.makeResObj(200, '', await ConfigService.getUnusedApplicationConfigFile(application, config_id));
	} catch (e) {
		logger.error('[getUnusedApplicationConfigFile]', e, ctx);
		ctx.makeErrResObj(500, e.toString());
	}
};


ConfigController.configFileList = async (ctx) => {
	let {level, application, set_name, set_area, set_group, server_name} = ctx.paramsObj;
	let list = [];
	try {
		if (!await AuthService.hasOpeAuth(application, server_name, ctx.uid)) {
		// if (!await AuthService.checkHasParentAuth({
		// 		application: application,
		// 		setName: set_name,
		// 		setArea: set_area,
		// 		setGroup: set_group,
		// 		serverName: server_name,
		// 		uid: ctx.uid
		// 	})) {
			ctx.makeNotAuthResObj();
		} else {
			switch (level) {
				case '1' :
					list = await ConfigService.getApplicationConfigFile(application);
					break;
				case '2' :
					if (!set_name) {
						return ctx.makeResObj(500, 'set_name #common.notempty#');
					}
					list = await ConfigService.getSetConfigFile({server_name: application, set_name: set_name});
					break;
				case '3' :
					if (!set_name || !set_area) {
						return ctx.makeResObj(500, 'set_name,set_area #common.notempty#');
					}
					list = await ConfigService.getSetConfigFile({
						server_name: application,
						set_name: set_name,
						set_area: set_area
					});
					break;
				case '4' :
					if (!set_name || !set_area || !set_group) {
						return ctx.makeResObj(500, 'set_name,set_area,set_group #common.notempty#');
					}
					list = await ConfigService.getSetConfigFile({
						server_name: application,
						set_name: set_name,
						set_area: set_area,
						set_group: set_group
					});
					break;
				case '5' :
					if (!server_name) {
						return ctx.makeResObj(500, 'server_name #common.notempty#');
					}
					list = await ConfigService.getServerConfigFile({
						server_name: `${application}.${server_name}`,
						set_name: set_name,
						set_area: set_area,
						set_group: set_group
					});
					break;
			}
			ctx.makeResObj(200, '', util.viewFilter(list, configListStruct));
		}
	} catch (e) {
		logger.error('[configFileList]', e, ctx);
		ctx.makeErrResObj(500, e.toString());
	}
};

ConfigController.addConfigFile = async (ctx) => {
	let params = ctx.paramsObj;
	try {

		if (!await AuthService.hasDevAuth(params.application, params.server_name, ctx.uid)) {

		// if (!await AuthService.checkHasParentAuth({
		// 		application: params.application,
		// 		setName: params.set_name,
		// 		setArea: params.set_area,
		// 		setGroup: params.set_group,
		// 		serverName: params.server_name,
		// 	  uid: ctx.uid
		// 	})) {
			ctx.makeNotAuthResObj();
		} else {

			if (!params.force && await ConfigService.hasConfigFile(params)) {
				ctx.makeResObj(500, "#cfg.dlg.exists#");
				return;
			}	

			let ret = await ConfigService.addConfigFile(params);
			ctx.makeResObj(200, '', util.viewFilter(ret, configListStruct));
		}
	} catch (e) {
		logger.error('[addConfigFile]', e, ctx);
		ctx.makeErrResObj(500, e.toString());
	}
};

ConfigController.deleteConfigFile = async (ctx) => {
	let id = ctx.paramsObj.id;
	try {
		let serverParams = await ConfigService.getServerInfoByConfigId(id);

		if (!await AuthService.hasDevAuth(serverParams.application, serverParams.serverName, ctx.uid)) {

		// if (!await AuthService.checkHasParentAuth(Object.assign(serverParams, {uid: ctx.uid}))) {
			ctx.makeNotAuthResObj();
		} else {
			ctx.makeResObj(200, '', await ConfigService.deleteConfigFile(id));
		}
	} catch (e) {
		logger.error('[deleteConfigFile]', e, ctx);
		ctx.makeErrResObj(500, e.toString());
	}
};

ConfigController.updateConfigFile = async (ctx) => {
	let params = ctx.paramsObj;
	try {

		let serverParams = await ConfigService.getServerInfoByConfigId(params.id);

		if (!await AuthService.hasDevAuth(serverParams.application, serverParams.serverName, ctx.uid)) {

		// if (!await AuthService.checkHasParentAuth(Object.assign(serverParams, {uid: ctx.uid}))) {
			ctx.makeNotAuthResObj();
		} else {
			params.lastuser = ctx.uid;
			let ret = await ConfigService.updateConfigFile(params);
			ctx.makeResObj(200, '', util.viewFilter(ret, configListStruct));
		}
	} catch (e) {
		logger.error('[updateConfigFile]', e, ctx);
		ctx.makeErrResObj(500, e.toString());
	}
};

ConfigController.configFile = async (ctx) => {
	let id = ctx.paramsObj.id;
	try {
		let serverParams = await ConfigService.getServerInfoByConfigId(id);

		if (!await AuthService.hasOpeAuth(serverParams.application, serverParams.serverName, ctx.uid)) {

		// if (!await AuthService.checkHasParentAuth(Object.assign(serverParams, {uid: ctx.uid}))) {
			ctx.makeNotAuthResObj();
		} else {
			let ret = await ConfigService.getConfigFile(id);
			ctx.makeResObj(200, '', util.viewFilter(ret, configListStruct));
		}
	} catch (e) {
		logger.error('[configFile]', e, ctx);
		ctx.makeErrResObj(500, e.toString());
	}
};

ConfigController.nodeConfigFileList = async (ctx) => {
	let {application, set_name, set_area, set_group, server_name, config_id} = ctx.paramsObj;
	try {

		if (!await AuthService.hasOpeAuth(application, server_name, ctx.uid)) {


		// if (!await AuthService.checkHasParentAuth({
		// 		application: application,
		// 		setName: set_name,
		// 		setArea: set_area,
		// 		setGroup: set_group,
		// 		serverName: server_name,
		// 		uid: ctx.uid
		// 	})) {
			ctx.makeNotAuthResObj();
		} else {
			let list = await ConfigService.getNodeConfigFile({
				application: application,
				server_name: server_name,
				set_name: set_name,
				set_area: set_area,
				set_group: set_group,
				config_id: config_id
			});
			ctx.makeResObj(200, '', util.viewFilter(list, configListStruct));
		}
	} catch (e) {
		logger.error('[nodeConfigFileList]', e, ctx);
		ctx.makeErrResObj(500, e.toString());
	}
};

ConfigController.getConfigFileHistory = async (ctx) => {
	let id = ctx.paramsObj.id;
	try {
		let ret = await ConfigService.getConfigFileHistory(id);
		if (ret && ret.configid != undefined) {
			let serverParams = await ConfigService.getServerInfoByConfigId(ret.configid);

			// if (!await AuthService.hasOpeAuth(serverParams.application, serverParams.server_name, ctx.uid)) {


			if (!await AuthService.checkHasParentAuth(Object.assign(serverParams, {uid: ctx.uid}))) {
				ctx.makeNotAuthResObj();
				return;
			}
		}
		ctx.makeResObj(200, '', util.viewFilter(ret, {
			id: '',
			configid: {key: 'config_id'},
			reason: '',
			content: '',
			posttime: {formatter: util.formatTimeStamp}
		}));
	} catch (e) {
		logger.error('[getConfigFileHistory]', e, ctx);
		ctx.makeErrResObj(500, e.toString());
	}
};

ConfigController.configFileHistoryList = async (ctx) => {
	let {config_id, currPage = 1, pageSize = 10} = ctx.paramsObj;
	try {
		let serverParams = await ConfigService.getServerInfoByConfigId(config_id);

		if (!await AuthService.hasOpeAuth(serverParams.application, serverParams.server_name, ctx.uid)) {

		// if (!await AuthService.checkHasParentAuth(Object.assign(serverParams, {uid: ctx.uid}))) {
			ctx.makeNotAuthResObj();
		} else {
			let ret = await ConfigService.getConfigFileHistoryList(config_id, currPage, pageSize);
			ctx.makeResObj(200, '', {
				count: ret.count,
				rows: util.viewFilter(ret.rows, {
					id: '',
					config_id: '',
					reason: '',
					content: '',
					posttime: {formatter: util.formatTimeStamp}
				})
			});
		}
	} catch (e) {
		logger.error('[configFileHistoryList]', e, ctx);
		ctx.makeErrResObj(500, e.toString());
	}
};

ConfigController.addConfigRef = async (ctx) => {
	let {config_id, reference_id} = ctx.paramsObj;
	try {
		let serverParams = await ConfigService.getServerInfoByConfigId(config_id);

		if (!await AuthService.hasDevAuth(serverParams.application, serverParams.serverName, ctx.uid)) {

		// if (!await AuthService.checkHasParentAuth(Object.assign(serverParams, {uid: ctx.uid}))) {
			ctx.makeNotAuthResObj();
		} else {
			let ret = await ConfigService.addConfigRef(config_id, reference_id);
			ctx.makeResObj(200, '', util.viewFilter(ret, {id: '', config_id: '', reference_id: ''}));
		}
	} catch (e) {
		logger.error('[addConfigRef]', e, ctx);
		ctx.makeErrResObj(500, e.toString());
	}
};

ConfigController.deleteConfigRef = async (ctx) => {
	let id = ctx.paramsObj.id;
	try {
		let serverParams = await ConfigService.getServerInfoByConfigId(id, 'refId');

		if (!await AuthService.hasDevAuth(serverParams.application, serverParams.serverName, ctx.uid)) {
		// if (!await AuthService.checkHasParentAuth(Object.assign(serverParams, {uid: ctx.uid}))) {
			ctx.makeNotAuthResObj();
		} else {
			ctx.makeResObj(200, '', await ConfigService.deleteConfigRef(id));
		}
	} catch (e) {
		logger.error('[deleteConfigRef]', e, ctx);
		ctx.makeErrResObj(500, e.toString());
	}
};

ConfigController.configRefList = async (ctx) => {
	let config_id = ctx.paramsObj.config_id;
	try {
		let serverParams = await ConfigService.getServerInfoByConfigId(config_id);
		if (!await AuthService.checkHasParentAuth(Object.assign(serverParams, {uid: ctx.uid}))) {
			ctx.makeNotAuthResObj();
		} else {
			ctx.makeResObj(200, '', await ConfigService.getConfigRefByConfigId(config_id));
		}
	} catch (e) {
		logger.error('[configRefList]', e, ctx);
		ctx.makeErrResObj(500, e.toString());
	}
};

ConfigController.mergedNodeConfig = async (ctx) => {
	let id = ctx.paramsObj.id;
	try {
		let serverParams = await ConfigService.getServerInfoByConfigId(id);
		if (!await AuthService.checkHasParentAuth(Object.assign(serverParams, {uid: ctx.uid}))) {
			ctx.makeNotAuthResObj();
		} else {
			let configFile = await ConfigService.getConfigFile(id);
			ctx.makeResObj(200, '', await AdminService.loadConfigByHost(configFile.server_name, configFile.filename, configFile.host));
		}
	} catch (e) {
		logger.error('[mergedNodeConfig]', e, ctx);
		ctx.makeErrResObj(500, e.toString());
	}
};


ConfigController.pushConfigFile = async (ctx) => {
	let ids = ctx.paramsObj.ids;
	try {

		ids = ids.split(/[,;]/);
		let list = await ConfigService.getConfigFileList(ids);
		let filename = '';
		let auth = await AuthService.hasOpeAuth(list[0].application, list[0].server_name, ctx.uid);
		let targets =list.map( (configFile) => {
			let [application, server_name] = configFile.server_name.split('.');
			filename = configFile.filename;


			return {
				application: application,
				serverName: server_name,
				nodeName: configFile.host
			};
		});

		if (!auth) {
			ctx.makeNotAuthResObj();
		} else {
			ctx.makeResObj(200, '', await AdminService.doCommand(targets, `tars.loadconfig ${filename}`));
		}

	} catch (e) {
		logger.error('[pushConfigFile]', e, ctx);
		ctx.makeErrResObj(500, e.toString());
	}
};


module.exports = ConfigController;