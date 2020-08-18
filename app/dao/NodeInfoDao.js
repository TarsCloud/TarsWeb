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

const {tNodeInfo} = require('./db').db_tars;
const Sequelize = require('sequelize');
const NodeInfoDao = {};

NodeInfoDao.getNodeInfo = async (endpointIps) => {
	return await tNodeInfo.findAll({
		where: {
			endpoint_ip: endpointIps
		}
	})
};

NodeInfoDao.hasNodeNode = async (nodeName) => {
	return await tNodeInfo.findOne({
		where: {
			node_name: nodeName
		}
	})
};

NodeInfoDao.updateNodeLabel = async (nodeName, label) => {
	return await tNodeInfo.update({
		label: label
	}, {
		where: {
			node_name: nodeName
		}
	})
};

NodeInfoDao.deleteNodeInfo = async (nodeName) => {
	return await tNodeInfo.destroy({
		where: {node_name: nodeName}
	});
};

NodeInfoDao.getNodeList = async () => {
	return await tNodeInfo.findAll({
		attributes: [[Sequelize.literal('distinct `node_name`'), 'node_name']],
	})
};

NodeInfoDao.getNodeInfoList = async (nodeName, curPage, pageSize) => {
	let where = {
		node_name: {
			//$like: '%' + templateName + '%'
			//syntax breaking changes after V5, should be:
			[Sequelize.Op.like]: '%' + nodeName + '%'
		}
	}
	// let where = {};
	let options = {
		raw: true,
		where,
		order: [['node_name', 'DESC']]
	};
	if (curPage && pageSize) {
		options.limit = pageSize;
		options.offset = pageSize * (curPage - 1);
	}
	return await tNodeInfo.findAndCountAll(options);
};


module.exports = NodeInfoDao;