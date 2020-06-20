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

const GatewayDao = require('../../dao/GatewayDao');
const logger = require('../../logger');
const util = require('../../tools/util');
const GatewayService = {};


GatewayService.getStationList = async (f_station_id, f_name_cn, filter_uid) => {
	return await GatewayDao.getStationList(f_station_id, f_name_cn, filter_uid);
};
GatewayService.addStation = async (params) => {
	return await GatewayDao.addStation(params);
};
GatewayService.updateStation = async (params) => {
	return await GatewayDao.updateStation(params);
};
GatewayService.deleteStation = async (f_id, filter_uid) => {
	return await GatewayDao.deleteStation(f_id, filter_uid);
};
GatewayService.getStationById = async (f_id, filter_uid) => {
	return await GatewayDao.getStationById(f_id, filter_uid);
};

GatewayService.getUpstreamList = async (f_upstream, filter_uid) => {
	return await GatewayDao.getUpstreamList(f_upstream, filter_uid);
};
GatewayService.addUpstream = async (params) => {
	return await GatewayDao.addUpstream(params);
};
GatewayService.updateUpstream = async (params) => {
	return await GatewayDao.updateUpstream(params);
};
GatewayService.deleteUpstream = async (f_id, filter_uid) => {
	return await GatewayDao.deleteUpstream(f_id, filter_uid);
};
GatewayService.getUpstreamById = async (f_id, filter_uid) => {
	return await GatewayDao.getUpstreamById(f_id, filter_uid);
};

GatewayService.getHttpRouterList = async (f_station_id, filter_uid) => {
	return await GatewayDao.getHttpRouterList(f_station_id, filter_uid);
};
GatewayService.addHttpRouter = async (params) => {
	params.f_server_name = params.f_server_name || "";
	return await GatewayDao.addHttpRouter(params);
};
GatewayService.updateHttpRouter = async (params) => {
	params.f_server_name = params.f_server_name || "";
	return await GatewayDao.updateHttpRouter(params);
};
GatewayService.deleteHttpRouter = async (f_id, filter_uid) => {
	return await GatewayDao.deleteHttpRouter(f_id, filter_uid);
};
GatewayService.getHttpRouterById = async (f_id, filter_uid) => {
	return await GatewayDao.getHttpRouterById(f_id, filter_uid);
};

GatewayService.addBWList = async (params, type, filter_uid) => {
	return await GatewayDao.addBWList(params, type, filter_uid);	
}
GatewayService.getBWList = async (f_station_id, type, filter_uid) => {
	return await GatewayDao.getBWList(f_station_id, type, filter_uid);
};
GatewayService.deleteBWList = async (f_id, type, filter_uid) => {
	return await GatewayDao.deleteBWList(f_id, type, filter_uid);
};
GatewayService.getFlowControl = async (f_station_id, filter_uid) => {
	return await GatewayDao.getFlowControl(f_station_id, filter_uid);
};
GatewayService.upsertFlowControl = async (params) => {
	return await GatewayDao.upsertFlowControl(params);
};
module.exports = GatewayService;