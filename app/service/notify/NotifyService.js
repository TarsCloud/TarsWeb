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

const NotifyDao = require('../../dao/NotifyDao');
const AdminService = require('../admin/AdminService')
const logger = require('../../../logger');
const serverService = require('../server/ServerService');
const _ = require('lodash');

const NotifyService = {}

NotifyService.getServerNotifyList = async (params, curPage, pageSize) => {
	var serverConfs = await serverService.getServerConfList4Tree(params, 0, 0);
	var serverIds = [];
	serverConfs.forEach((v) => {
		serverIds.push(v.application + '.' + v.server_name + '_' + v.node_name);
	});
	return await NotifyDao.getServerNotifyList(serverIds, curPage, pageSize);
}

NotifyService.getServerNotifyListByServerName = async (params) => {
	return await NotifyDao.getServerNotifyList([`${params.application}.${params.serverName}_${params.node}`], params.curPage, params.pageSize);
}

//查询服务最新的实时状态(节点配置->tarsnode实时最新状态)
NotifyService.getServerLastNotify = async (server_id) => {
	return await NotifyDao.getServerLastNotify(server_id)
}

//获取某台服务器的基本负载情况
NotifyService.getMachineStatusInfo = async (params) => {
	return await AdminService.getMachineStatusInfo(params)
}


module.exports = NotifyService;