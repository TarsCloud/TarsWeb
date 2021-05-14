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

const ConfigDao = require('../../dao/ConfigDao');
const ServerDao = require('../../dao/ServerDao');
const logger = require('../../logger');

const ConfigService = {};

ConfigService.getUnusedApplicationConfigFile = async (application, configId) => {
	return await ConfigDao.getUnusedApplicationConfigFile(application, configId);
};

ConfigService.hasConfigFile = async (params) => {
	const APP_LEVEL = 1;        // 应用配置，set配置
	const SERVER_LEVEL = 2;     // 服务配置

	let paramsObj = {};
	paramsObj.level = params.level == 5 ? SERVER_LEVEL : APP_LEVEL;

	paramsObj.server_name = paramsObj.level === APP_LEVEL ? params.application : `${params.application}.${params.server_name}`;

	Object.assign(paramsObj, {
		set_name: params.set_name || '',
		set_area: params.set_area || '',
		set_group: params.set_group || '',
		filename: params.filename.replace(/(^\s*)|(\s*$)/g, ''),
	});

	let configFile = await ConfigDao.findServerConfigFile(paramsObj);

	if (configFile) {
		return true;
	}
	return false;
};

/**
 * 新增配置文件
 * @param params
 * # level 服务层级
 * # application
 * # server_name
 * # set_name
 * # set_area
 * # set_group
 * # filename  文件名
 * # config    配置内容
 * @return {Promise.<*>}
 */
ConfigService.addConfigFile = async (params) => {
	const APP_LEVEL = 1;        // 应用配置，set配置
	const SERVER_LEVEL = 2;     // 服务配置

	let paramsObj = {};
	paramsObj.level = params.level == 5 ? SERVER_LEVEL : APP_LEVEL;

	paramsObj.server_name = paramsObj.level === APP_LEVEL ? params.application : `${params.application}.${params.server_name}`;

	Object.assign(paramsObj, {
		set_name: params.set_name || '',
		set_area: params.set_area || '',
		set_group: params.set_group || '',
		filename: params.filename.replace(/(^\s*)|(\s*$)/g, ''),
		config: params.config.replace(/^\s|\s$/g, ''),
		posttime: formatToStr(new Date(), 'yyyy-mm-dd hh:mm:ss')
	});

	let configFile;

	if (!params.force) {
		configFile = await ConfigDao.insertConfigFile(paramsObj);
	} else {

		await ConfigDao.replaceConfigFile(paramsObj);

		configFile = await ConfigDao.findServerConfigFile(paramsObj);

		configFile = configFile.dataValues;
	}

	let history = {
		configid: configFile.id,
		reason: 'add config',
		content: configFile.config,
		posttime: configFile.posttime
	};

	ConfigDao.insertConfigFileHistory(history).catch(e => logger.error('[insertConfigFileHistory]:', e));

	// insert default node config
	if (paramsObj.level == 2) {
		ConfigService.addDefaultNodeConfigFile(configFile, params.force);
	}

	return Promise.resolve(configFile);
};

/**
 * 删除配置文件
 * @param id
 * @return {Promise.<*>}
 */
ConfigService.deleteConfigFile = async (id) => {
	let list = await ConfigDao.getConfigRefList(id);
	if (list.length > 0) {
		return Promise.reject('#config.notDelete#');
	}
	let configFile = await ConfigDao.getConfigFile(id);
	if (configFile.level == 2) {
		let nodeConfigFiles = await ConfigDao.getNodeConfigFile({
			server_name: configFile.server_name,
			set_name: configFile.set_name,
			set_area: configFile.set_area,
			set_group: configFile.set_group
		});
		nodeConfigFiles = nodeConfigFiles.filter(config => config.filename == configFile.filename);
		nodeConfigFiles.forEach(config => {
			ConfigDao.deleteConfigFile(config.id).catch(e => logger.error('[deleteConfigFile]:', e));
		});
	}
	await ConfigDao.deleteConfigFile(id).catch(e => {
		logger.error('[deleteConfigFile]:', e);
		return Promise.reject(e);
	});
	return Promise.resolve(id);
};

/**
 * 更新配置文件
 * @param params
 * # id
 * # config
 * # reason
 * @return {*}
 */
ConfigService.updateConfigFile = async (params) => {
	let configFile = await ConfigDao.getConfigFile(params.id);
	Object.assign(configFile, {
		config: params.config,
		reason: params.reason,
		lastuser:params.lastuser,
		posttime: formatToStr(new Date(), 'yyyy-mm-dd hh:mm:ss')
	});
	await ConfigDao.updateConfigFile(configFile).catch(e => {
		return Promise.reject(e);
	});

	let history = {
		configid: configFile.id,
		reason: configFile.reason,
		content: configFile.config,
		posttime: configFile.posttime
	};

	ConfigDao.insertConfigFileHistory(history).catch(e => logger.error('[insertConfigFileHistory]:', e));

	return await ConfigDao.getConfigFile(params.id);
};

/**
 * 获取配置文件
 * @param id
 * @return {*}
 */
ConfigService.getConfigFile = async (id) => {
	return await ConfigDao.getConfigFile(id);
};

/**
 * 通过配置文件id或引用记录Id获取应用服务set信息
 * @param id
 * @param type
 * @returns {{application: string, setName: (*|string), setArea: (*|string), setGroup: (*|string), serverName: string}}
 */
ConfigService.getServerInfoByConfigId = async (id, type) => {
	let config = {};
	if (type == 'refId') {
		config = await ConfigDao.getConfigFileByRefTableId(id) || {};
	} else {
		config = await ConfigDao.getConfigFile(id) || {};
	}
	let server = config.server_name || '';
	let idx = server.indexOf('.');
	let application = '', serverName = '';
	if (idx > -1) {
		application = server.substring(0, idx);
		serverName = server.substring(idx + 1);
	} else {
		application = server;
	}
	return {
		application: application,
		setName: config.set_name || '',
		setArea: config.set_area || '',
		setGroup: config.set_group || '',
		serverName: serverName
	};
};


ConfigService.getConfigFileList = async (ids) => {
	return await ConfigDao.getConfigFileList(ids);
};

/**
 * 获取服务配置
 * # application
 * # server_name
 * # set_name
 * # set_area
 * # set_group
 * @return {*}
 */
ConfigService.getServerConfigFile = async (params) => {
	return await ConfigDao.getServerConfigFile(params);
};

/**
 * 获取应用配置
 * @param application
 * @return {*}
 */
ConfigService.getApplicationConfigFile = async (application) => {
	return await ConfigDao.getApplicationConfigFile(application);
};

/**
 * 获取SET配置
 * @param params
 * # application
 * # set_name
 * # set_area
 * # set_group
 * @return {*}
 */
ConfigService.getSetConfigFile = async (params) => {
	params.set_area = params.set_area || '';
	params.set_group = params.set_group || '';
	return await ConfigDao.getSetConfigFile(params);
};

/**
 * 获取节点配置
 * @param params
 * # application
 * # server_name
 * # set_name
 * # set_area
 * # set_group
 * # configId
 * @return {*}
 */
ConfigService.getNodeConfigFile = async (params) => {
	const enableSet = params.set_name && params.set_area && params.set_group;
	const configFile = await ConfigDao.getConfigFile(params.config_id);
	let nodeConfigFile = await ConfigDao.getNodeConfigFile({
		server_name: `${params.application}.${params.server_name}`,
		set_name: params.set_name || '',
		set_area: params.set_area || '',
		set_group: params.set_group || ''
	});
	let servers = await ServerDao.getServerConf({
    application:params.application,
		serverName: params.server_name,
		enableSet: enableSet ? 'Y' : 'N',
		setName: params.set_name,
		setArea: params.set_area,
		setGroup: params.set_group
	});
	let list = [], nodeConfigFileList = [];
	nodeConfigFile = nodeConfigFile.filter(config => config.filename == configFile.filename);
	nodeConfigFile.forEach(config => {
		list.push(`${config.server_name}.${config.set_name || ''}.${config.set_area || ''}.${config.set_group || ''}_${config.host}`);
	});
	servers = servers.filter((server, index) => {
		let key = `${params.application}.${params.server_name}.${params.set_name || ''}.${params.set_area || ''}.${params.set_group || ''}_${server.node_name}`;
		let exist = list.includes(key);
		//只返回选中服务节点的配置，例如选中无set的服务时，不要返回带set服务的节点配置
		if(exist){
			nodeConfigFileList.push(nodeConfigFile[index]);
		}
		return !exist;
	});
	for (let i = 0, len = servers.length; i < len; i++) {
		let server = servers[i];
		let newRow = {
			server_name: `${params.application}.${params.server_name}`,
			set_name: params.set_name,
			set_area: params.set_area,
			set_group: params.set_group,
			filename: configFile.filename,
			host: server.node_name,
			config: '',
			level: 3,
			posttime: formatToStr(new Date(), 'yyyy-mm-dd hh:mm:ss')
		};
		let config = await ConfigDao.insertConfigFile(newRow).catch(e => logger.error('[insertConfigFile]:', e));
		config = config.get({'plain': true});
		let history = {
			configid: config.id,
			reason: 'add config',
			content: config.config,
			posttime: config.posttime
		};
		await ConfigDao.insertConfigFileHistory(history).catch(e => logger.error('[insertConfigFileHistory]:', e));
	}
	return await nodeConfigFileList;
};

/**
 * 获取配置文件修改记录
 * @param id
 * @return {*}
 */
ConfigService.getConfigFileHistory = async (id) => {
	return await ConfigDao.getConfigFileHistory(id);
};

/**
 * 获取配置文件修改记录列表
 * @param config_id
 * @param curPage
 * @param pageSize
 * @return {*}
 */
ConfigService.getConfigFileHistoryList = async (config_id, curPage, pageSize) => {
	return await ConfigDao.getConfigFileHistoryList(config_id, curPage, pageSize);
};

/**
 * 添加引用文件
 * @param config_id
 * @param reference_id
 * @return {{id: string, config_id: string, reference_id: string}}
 */
ConfigService.addConfigRef = async (config_id, reference_id) => {
	return await ConfigDao.insertConfigRef(config_id, reference_id);
};

/**
 * 删除引用文件
 * @param id
 * @return {id}
 */
ConfigService.deleteConfigRef = async (id) => {
	await ConfigDao.deleteConfigRef(id).then(() => {
		return Promise.resolve(id);
	}).catch(e => {
		logger.error('[deleteConfigRef]:', e);
		return Promise.reject(e)
	});
};

/**
 * 引用列表
 * @param config_id
 * @return {*[]}
 */
ConfigService.getConfigRefByConfigId = async (config_id) => {
	let list = await ConfigDao.getConfigRefByConfigId(config_id);
	let refList = [];
	list.forEach(configFile => {
		let obj = {
			id: configFile.id,
			config_id: configFile.config_id,
			reference: {
				id: configFile.t_config_file.id,
				server_name: configFile.t_config_file.server_name,
				node_name: configFile.t_config_file.host,
				set_name: configFile.t_config_file.set_name,
				set_area: configFile.t_config_file.set_area,
				set_group: configFile.t_config_file.set_group,
				filename: configFile.t_config_file.filename,
				config: configFile.t_config_file.config,
				level: configFile.t_config_file.level,
				posttime: formatToStr(new Date(configFile.t_config_file.posttime), 'yyyy-mm-dd hh:mm:ss')
			}
		};
		refList.push(obj);
	});
	return refList;
};

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

ConfigService.addDefaultNodeConfigFile = (params, force) => {

	// 传了节点时
	const addConfigFileByNodeName = async () => {
		const configs = await ConfigDao.getServerConfigFile({
			server_name: params.server_name,
			set_name: params.set_name,
			set_area: params.set_area,
			set_group: params.set_group
		});
		for (let i = 0, len = configs.length; i < len; i++) {
			let config = configs[i];
			let newRow = Object.assign({}, {
				id: config.id,
				posttime: formatToStr(new Date(), 'yyyy-mm-dd hh:mm:ss'),
				lastuser: config.lastuser,
				level: 3,
				host: params.node_name
			});
			let configFile = await ConfigDao.insertConfigFile(newRow);
			configFile = configFile.dataValues;
			const history = {
				configid: configFile.id,
				reason: 'add config',
				content: configFile.config,
				posttime: configFile.posttime
			};

			ConfigDao.insertConfigFileHistory(history).catch(e => logger.error('[insertConfigFileHistory]:', e));
		}
	};

	// 传了文件名时
	const addConfigFileByFileName = async () => {
		const [application, serverName] = params.server_name.split('.');
		const enableSet = params.set_name && params.set_area && params.set_group;
		const servers = await ServerDao.getServerConf({
			application: application,
			serverName: serverName,
			enableSet: enableSet ? 'Y' : 'N',
			setName: params.set_name,
			setArea: params.set_area,
			setGroup: params.set_group
		});
		for (let i = 0, len = servers.length; i < len; i++) {
			let server = servers[i];
			let newRow = Object.assign({}, {
				server_name: params.server_name,
				set_name: params.set_name,
				set_area: params.set_area,
				set_group: params.set_group,
				filename: params.filename,
				config: '',
				host: server.node_name,
				posttime: formatToStr(new Date(), 'yyyy-mm-dd hh:mm:ss'),
				lastuser: params.lastuser||'',
				level: 3,
			});

			let configFile;
			
			if (force) {
				await ConfigDao.replaceConfigFile(newRow).catch(e => logger.error('[addConfigFileByFileName.replaceConfigFile]:', e));

				configFile = await ConfigDao.findServerConfigFile(newRow);

			} else {
				configFile = await ConfigDao.insertConfigFile(newRow).catch(e => logger.error('[addConfigFileByFileName.insertConfigFile]:', e));
			}

			configFile = configFile.dataValues;
			const history = {
				configid: configFile.id,
				reason: 'add config',
				content: configFile.config,
				posttime: configFile.posttime
			};
			ConfigDao.insertConfigFileHistory(history).catch(e => logger.error('[insertConfigFileHistory]:', e));
		}
	};


	let keys = Array.from(Object.keys(params));
	if (keys.includes('node_name')) {
		addConfigFileByNodeName();
	} else {
		addConfigFileByFileName();
	}
}


module.exports = ConfigService;