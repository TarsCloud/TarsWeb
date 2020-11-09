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

const {tAdapterConf, sequelize} = require('./db').db_tars;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const AdapterDao = {};

AdapterDao.getAdapterConfById = async (id) => {
	return await tAdapterConf.findOne({
		where: {
			id: id
		}
	});
};

AdapterDao.getAdapterConf = async (application, serverName, nodeName) => {
	let whereObj = {
		application: application,
		server_name: serverName
	};
	if (nodeName) {
		Object.assign(whereObj, {node_name: nodeName});
	}
	return await tAdapterConf.findAll({
		raw: true,
		where: whereObj
	});
};

AdapterDao.getServantByServerName = async (application, serverName) => {
	let whereObj = {
		application: application,
		server_name: serverName
	};
	return await tAdapterConf.findAll({
		attributes: ['servant'],
		group: 'servant',
		raw: true,
		where: whereObj
	});
}


AdapterDao.getAdapterConfByObj = async (params) => {
	return await tAdapterConf.findOne({
		where: {
			application: params.application,
			server_name: params.serverName,
			node_name: params.nodeName,
			adapter_name: params.application + '.' + params.serverName + '.' + params.objName + 'Adapter'
		}
	});
};

AdapterDao.getAdapterConfByNodeName = async (nodeNames) => {
	return await tAdapterConf.findAll({
		where: {
			node_name: nodeNames
		}
	});
};

AdapterDao.insertAdapterConf = async (params, transaction) => {
	if (transaction) {
		return await tAdapterConf.upsert(params, {transaction: transaction});
	} else {
		await tAdapterConf.upsert(params);
		return await tAdapterConf.findOne({
			where: {
				application: params.application,
				server_name: params.server_name,
				node_name: params.node_name,
				adapter_name: params.adapter_name,
				endpoint: params.endpoint,
			}
		})

	}
};

AdapterDao.deleteAdapterConf = async (id) => {
	return await tAdapterConf.destroy({
		where: {id: id}
	});
};

AdapterDao.updateAdapterConf = async (params) => {
	return await tAdapterConf.update(params, {where: {id: params.id}});
};

AdapterDao.getAdapterProxy =  async (params)  =>{
	let where = {
		[Op.or]:[{
			application:{[Op.ne]:'DCache'}
		},{
			[Op.and]:[
				{application:{[Op.eq]:'DCache'}},
				{server_name:{[Op.in]:['ConfigServer','DCacheOptServer','PropertyServer']}}
			]
		}
		]
	}
	params.application != undefined && (where.application = params.application);
	params.serverName != undefined && (where.server_name = params.serverName);
	let options = {
		where: where,
		order: [['application'], ['server_name']]
	};
	if (params.curPage && params.pageSize) {
		options.limit = params.pageSize;
		options.offset = params.pageSize * (params.curPage - 1);
	}
	return  await tAdapterConf.findAndCountAll(options);
}
module.exports = AdapterDao;