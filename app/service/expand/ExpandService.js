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

const ServerDao = require('../../dao/ServerDao');
const AdapterDao = require('../../dao/AdapterDao');
const ConfigDao = require('../../dao/ConfigDao');
const logger = require('../../logger');
const ServerService = require('../server/ServerService');
const AuthService = require('../auth/AuthService');
const _ = require('lodash');
const util = require('../../tools/util');
const Sequelize = require('sequelize');
// const resourceConf = require('../../../config/resourceConf');
// const ResourceService = require('../resource/ResourceService');

/**
 * 将Date对象变成字符串
 * @param {Object} date
 * @param {String} format
 * @return {String} date 返回经指定格式格式化后的时间字符串
 */
function formatToStr(date, format) {
	if (!date || date == 'Invalid Date') return;
	return format.replace(/yyyy/gi, date.getFullYear().toString())
		.replace(/MM/i, formatNum(date.getMonth() + 1))
		.replace(/dd/gi, formatNum(date.getDate()))
		.replace(/hh/gi, formatNum(date.getHours()))
		.replace(/mm/gi, formatNum(date.getMinutes()))
		.replace(/ss/gi, formatNum(date.getSeconds()));

	function formatNum(n) {
		return (n < 10 ? '0' + n : n).toString();
	}
}

const ExpandService = {}

ExpandService.preview = async (params) => {
	let application = params.application;
	let serverName = params.server_name;
	let sourceServer = await ServerDao.getServerConfByName(application, serverName, params.node_name);
	let sourceAdapter = await AdapterDao.getAdapterConf(application, serverName, params.node_name);
	let result = [];

	// console.log(sourceServer, sourceAdapter);

	params.expand_nodes.forEach((expandNode) => {
		sourceAdapter.forEach((adapter) => {
			// adapter = adapter.dataValues;
			let preServer = {
				application: application,
				server_name: serverName,
				node_name: expandNode,
				template_name: sourceServer.template_name,
				port: 0,
				auth: 0
			};
			if (params.enable_set) {
				preServer.set = [params.set_name, params.set_area, params.set_group].join('.');
			} else {
				preServer.set = '';
			}
			let servant = adapter.servant;
			preServer.obj_name = servant.substring(servant.lastIndexOf('.') + 1);
			preServer.bind_ip = expandNode;
			preServer.status = expandNode == sourceServer.node_name ? "#api.expand.node.status.existent#" : "#api.expand.node.status.nonexistent#";

			// console.log(preServer);
			
			result.push(preServer);
		});
	});
	return result;
};

ExpandService.expand = async (params) => {
	let transaction = await ServerDao.sequelize.transaction(); //开启事务
	try {
		let application = params.application;
		let serverName = params.server_name;
		let sourceServer = await ServerDao.getServerConfByName(application, serverName, params.node_name);
		let sourceAdapters = await AdapterDao.getAdapterConf(application, serverName, params.node_name) || [];
		sourceServer = sourceServer && sourceServer.dataValues || {};
		let addServers = [];
		let addServersMap = {};
		let addNodeNameMap = {};
		for (var i = 0; i < params.expand_preview_servers.length; i++) {
			let preServer = params.expand_preview_servers[i];
			if (!addServersMap[`${application}-${serverName}-${preServer.node_name}`]) {
				let serverConf = await ServerDao.getServerConfByName(application, serverName, preServer.node_name);
				if (!serverConf) {
					let server = {
						application: application,
						server_name: serverName,
						node_name: preServer.node_name
					};
					let enableSet = !_.isEmpty(preServer.set);
					server.enable_set = enableSet ? 'Y' : 'N';
					if (enableSet) {
						server = _.extend(server, _.zipObject(['set_name', 'set_area', 'set_group'], preServer.set.split('.')));
					} else {
						server = _.extend(server, _.zipObject(['set_name', 'set_area', 'set_group'], [null, null, null]));
					}
					server = _.extend(server, {
						server_type: sourceServer.server_type,
						template_name: sourceServer.template_name,
						bak_flag: sourceServer.bak_flag,
						base_path: sourceServer.base_path,
						exe_path: sourceServer.exe_path,
						start_script_path: sourceServer.start_script_path,
						patch_version: sourceServer.patch_version,
					});
					server = util.leftAssign(ServerService.serverConfFields(), server);
					let rst = await ServerDao.insertServerConf(server, transaction);

					addServers.push(rst.dataValues);

					addServersMap[`${server.application}-${server.server_name}-${server.node_name}`] = true;
					addNodeNameMap[server.node_name] = true;
					if (params.copy_node_config) {
						let configParams = {
							server_name: `${sourceServer.application}.${sourceServer.server_name}`
						};
						sourceServer.set_name && (configParams.set_name = sourceServer.set_name);
						sourceServer.set_area && (configParams.set_area = sourceServer.set_area);
						sourceServer.set_group && (configParams.set_group = sourceServer.set_group);
						let configList = await ConfigDao.getNodeConfigFile(configParams);
						let configs = configList.filter((config) => {
							config = config.dataValues;
							return config.host == sourceServer.node_name
						});
						for (let i = 0; i < configs.length; i++) {
							let config = configs[i].dataValues;
							let newConfig = {
								server_name: '',
								set_name: '',
								set_area: '',
								set_group: '',
								host: '',
								filename: '',
								config: '',
								posttime: '',
								level: 2,
								config_flag: 0,
								lastuser: '',
							};
							newConfig = util.leftAssign(newConfig, config);
							newConfig.posttime =new Date();
							newConfig.host = server.node_name;
							let perConfigNode = configList.find((item) => {
								// `server_name`,`filename`,`host`,`level`,`set_name`,`set_area`,`set_group`  组成唯一值
								const { server_name, filename, host, level, set_name, set_area, set_group } = item.dataValues;
								const { server_name: nserver_name, filename: nfilename, host: nhost, level: nlevel, set_name: nset_name, set_area: nset_area, set_group: nset_group } = newConfig;
								return server_name === nserver_name && filename === nfilename && host === nhost && level === nlevel && set_name === nset_name && set_area === nset_area && set_group === nset_group
							});
							if (perConfigNode) await ConfigDao.deleteConfigFile(perConfigNode.dataValues.id, transaction);
							await ConfigDao.insertConfigFile(newConfig, transaction);
						}
					}
				}
			}

			let targetAdapter = await AdapterDao.getAdapterConfByObj({
				application: application,
				serverName: serverName,
				nodeName: preServer.node_name,
				objName: preServer.obj_name
			});
			if (!targetAdapter) {
				let sourceAdapter = ((application, serverName, nodeName, objName) => {
					let sourceAdapter = {};
					_.each(sourceAdapters, (adapter) => {
						adapter = adapter;
						if (adapter.application == application && adapter.server_name == serverName && adapter.node_name == nodeName && adapter.servant.substring(adapter.servant.lastIndexOf('.') + 1) == objName) {
							sourceAdapter = adapter;
							return false;
						}
					});
					return sourceAdapter;
				})(application, serverName, params.node_name, preServer.obj_name);
				if (_.isEmpty(sourceAdapter)) {
					return;
				}
				let adapter = {
					application: application,
					server_name: serverName,
					node_name: preServer.node_name,
					servant: sourceAdapter.servant,
					adapter_name: sourceAdapter.adapter_name,
					thread_num: sourceAdapter.thread_num,
					max_connections: sourceAdapter.max_connections,
					queuecap: sourceAdapter.queuecap,
					queuetimeout: sourceAdapter.queuetimeout,
					allow_ip: sourceAdapter.allow_ip,
					protocol: sourceAdapter.protocol,
					handlegroup: sourceAdapter.handlegroup,
					posttime: new Date('1970-01-01 00:00:00')
				};
				let portType = sourceAdapter.endpoint.substring(0, sourceAdapter.endpoint.indexOf(' '));
				portType = _.indexOf(['tcp', 'udp', 'ssl'], portType) > -1 ? portType : 'tcp';
				adapter.endpoint = portType + ' -h ' + preServer.bind_ip + ' -t ' + sourceAdapter.queuetimeout + ' -p ' + preServer.port + ' -e ' + (preServer.auth ? preServer.auth : 0);
				// console.log('adapter', adapter);
				await AdapterDao.insertAdapterConf(adapter, transaction);
			}
		}
		await transaction.commit();

		let rst = {server_conf: addServers, tars_node_rst: []};
		// let addNodeName = _.keys(addNodeNameMap);
		// if (resourceConf.enableAutoInstall && addNodeName && addNodeName.length) {
		// 	rst.tars_node_rst = await ResourceService.installTarsNodes(addNodeName);
		// }
		return rst;
	} catch (e) {
		await transaction.rollback();
		throw new Error(e);
	}
};

ExpandService.formatToArray = (list, key) => {
	let rst = [];
	list.forEach((item) => {
		rst.push(item[key]);
	});
	return rst;
};

ExpandService.getApplication = async (uid) => {
	if (await AuthService.hasAdminAuth(uid)) {
		return ExpandService.formatToArray(await ServerDao.getApplication(), 'application');
	} else {
		let authList = await AuthService.getAuthListByUid(uid);
		let appList = [];
		authList.forEach((auth) => {
			let application = auth.application;
			appList.push(application);
		});
		return _.uniq(appList);
	}
};

ExpandService.getServerName = async (application, uid) => {
	let serverList = [];

	if (await AuthService.hasAdminAuth(uid)) {
		serverList = ExpandService.formatToArray(await ServerDao.getServerName(application), 'server_name');
	} else {
		let authList = await AuthService.getAuthListByUid(uid);
		
		for (var i = 0; i < authList.length; i++) {
			let auth = authList[i];
			let authApplication = auth.application;
			let authServerName = auth.serverName;

			if (authServerName) {

				if (authApplication == application) {
					serverList.push(authServerName);
				}
			} else if (authApplication == application) {
				let serverConfs = await ServerDao.getServerConf({
					application: application
				});
				serverConfs.forEach((serverConf) => {
					serverConf = serverConf.dataValues;
					serverList.push(serverConf.server_name);
				})
			}
		}

		serverList = _.uniq(serverList);
	}

	if (application == "DCache") {
		serverList = serverList.filter(item => { return item.indexOf("CacheServer") == -1; });
	}
	return serverList;

};

ExpandService.getSet = async (application, serverName) => {
	return ExpandService.formatToArray(await ServerDao.getSet(application, serverName), 'set');
};

ExpandService.getObj = async (application, serverName, uid) => {
	if (await AuthService.hasAdminAuth(uid)) {
		return ExpandService.formatToArray(await ServerDao.getObj(application, serverName), 'servant');
	} else {
		let authList = await AuthService.getAuthListByUid(uid);
		for(let auth of authList){
			if(auth.application == application || auth.serverName == serverName){
				return ExpandService.formatToArray(await ServerDao.getObj(application, serverName), 'servant');
			}
		}
	}
	return []
};

ExpandService.getNodeName = async (application, serverName, set) => {
	let params = {
		application: application,
		serverName: serverName
	};
	if (!_.isEmpty(set)) {
		params.enableSet = true;
		let setObj = set.split('.');
		params.setName = setObj[0] || '';
		params.setArea = setObj[1] || '';
		params.setGroup = setObj[2] || ''
	} else {
		params.enableSet = false;
	}
	return ExpandService.formatToArray(await ServerDao.getNodeName(params), 'node_name');
};

module.exports = ExpandService;