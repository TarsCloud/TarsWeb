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

const {tServerConf, sequelize} = require('./db').db_tars;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const ServerDao = {};

ServerDao.sequelize = sequelize;

ServerDao.getServerConfById = async (id) => {
	return await tServerConf.findOne({
		where: {
			id
		}
	});
};

ServerDao.getServerConfList = async (application, serverName) => {
	return await tServerConf.findAll({
		where: {
			application: application,
			server_name: serverName
		}
	});
};

ServerDao.getServerConfByName = async (application, serverName, nodeName) => {
	return await tServerConf.findOne({
		where: {
			application: application,
			server_name: serverName,
			node_name: nodeName
		}
	});
};

ServerDao.getServerConfByNodeName = async (nodeName) => {
	return await tServerConf.findAll({
		where: {
			node_name: nodeName
		}
	});
};

ServerDao.getServerConf = async (params) => {
	let where = {};
	params.application != undefined && (where.application = params.application);
	params.serverName != undefined && (where.server_name = params.serverName);
	params.nodeName != undefined && (where.node_name = params.nodeName);
	if (params.enableSet) {
		if (params.enableSet == 'Y') {
			params.setName && (where.set_name = params.setName);
			params.setArea && (where.set_area = params.setArea);
			params.setGroup && (where.set_group = params.setGroup);
		} else {
			where.enable_set = 'N'
		}
	}
	let options = {
		where: where,
		order: [['application'], ['server_name']]
	};
	if (params.curPage && params.pageSize) {
		options.limit = params.pageSize;
		options.offset = params.pageSize * (params.curPage - 1);
	}
	return await tServerConf.findAll(options);
};

ServerDao.getServerConfByTemplate = async (templateName) => {
	return await tServerConf.findAll({
		where: {
			template_name: templateName
		}
	})
};

ServerDao.getServerConf4Tree = async (applicationList, serverNameList, allAttr) => {
	let or = [];
	if (Array.isArray(applicationList) && applicationList.length) {
		or.push({application: applicationList});
	}
	if (Array.isArray(serverNameList) && serverNameList.length) {
		or.push(Sequelize.where(Sequelize.fn('concat', Sequelize.col('application'), '.', Sequelize.col('server_name')), {[Op.in]: serverNameList}));
	}

	let option = {};
	if (or.length) {
 		option.where = {[Op.or]: or};
	}

	if (!allAttr) {
		option.attributes = [[Sequelize.literal('distinct `application`'), 'application'],
			'server_name', 'enable_set', 'set_name', 'set_area', 'set_group'
		]
	}
	return await tServerConf.findAll(option);
};


ServerDao.getInactiveServerConfList = async (application, serverName, nodeName, curPage, pageSize) => {
	let where = {};
	application && (where.application = application);
	serverName && (where.server_name = serverName);
	nodeName && (where.node_name = nodeName);
	where.setting_state = 'inactive';
	let options = {
		where: where,
		order: [['application'], ['server_name']]
	};
	if (curPage && pageSize) {
		options.limit = pageSize;
		options.offset = pageSize * (curPage - 1);
	}
	return await tServerConf.findAll(options);
};

ServerDao.updateServerConf = async (params) => {
	let updateOptions = {
		bak_flag: params.bak_flag,
		template_name: params.template_name,
		server_type: params.server_type,
		enable_set: params.enable_set,
		set_name: params.set_name,
		set_area: params.set_area,
		set_group: params.set_group,
		async_thread_num: params.async_thread_num,
		base_path: params.base_path,
		exe_path: params.exe_path,
		start_script_path: params.start_script_path,
		stop_script_path: params.stop_script_path,
		monitor_script_path: params.monitor_script_path,
		profile: params.profile,
		posttime: params.posttime
	};
	return await tServerConf.update(updateOptions, {where: {id: params.id}});
};

ServerDao.insertServerConf = async (params, transaction) => {
	if (transaction) {
		return await tServerConf.create(params, {transaction: transaction});
	} else {
		return await tServerConf.create(params);
	}
};

ServerDao.getApplication = async () => {
	return await tServerConf.findAll({
		attributes: [[Sequelize.literal('distinct `application`'), 'application']]
	});
};

ServerDao.getServerName = async (application) => {
	return await tServerConf.findAll({
		attributes: [[Sequelize.literal('distinct `server_name`'), 'server_name']],
		where: {
			application: application
		}
	});
};

ServerDao.getSet = async (application, serverName) => {
	let rst = await tServerConf.sequelize.query('select distinct if(enable_set = \'Y\', CONCAT(set_name, \'.\', set_area, \'.\', set_group), \'\') as \'set\' from db_tars.t_server_conf where application = \'' + application + '\' and server_name = \'' + serverName + '\'');
	return rst[0] || '';
};

ServerDao.getNodeName = async (params) => {
	let where = {
		application: params.application,
		server_name: params.serverName,
	}
	if (params.enableSet) {
		where = Object.assign(where, {
			enable_set: 'Y',
			set_name: params.setName,
			set_area: params.setArea,
			set_group: params.setGroup
		});
	} else {
		where.enable_set = 'N'
	}
	return await tServerConf.findAll({
		attributes: [[Sequelize.literal('distinct `node_name`'), 'node_name']],
		where: where
	})
}

ServerDao.getNodeNameList = async (params) => {
	let where = {
		application: params.application,
		server_name: params.server_name,
	}
	return await tServerConf.findAll({
		attributes: [[Sequelize.literal('distinct `node_name`'), 'node_name']],
		where: where,
		raw: true
	})
};

ServerDao.destroy = async (where = {}) => {
	return tServerConf.destroy({where})
};

module.exports = ServerDao;