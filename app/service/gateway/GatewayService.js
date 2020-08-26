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


GatewayService.getStationList = async (dbObj, f_station_id, f_name_cn, filter_uid) => {
	return await GatewayDao.getStationList(dbObj,f_station_id, f_name_cn, filter_uid);
};
GatewayService.addStation = async (dbObj,params) => {
	return await GatewayDao.addStation(dbObj,params);
};
GatewayService.updateStation = async (dbObj,params) => {
	return await GatewayDao.updateStation(dbObj,params);
};
GatewayService.deleteStation = async (dbObj,f_id, filter_uid) => {
	return await GatewayDao.deleteStation(dbObj,f_id, filter_uid);
};
GatewayService.getStationById = async (dbObj,f_id, filter_uid) => {
	return await GatewayDao.getStationById(dbObj,f_id, filter_uid);
};

GatewayService.getUpstreamList = async (dbObj,f_upstream, filter_uid) => {
	return await GatewayDao.getUpstreamList(dbObj,f_upstream, filter_uid);
};
GatewayService.addUpstream = async (dbObj,params) => {
	return await GatewayDao.addUpstream(dbObj,params);
};
GatewayService.updateUpstream = async (dbObj,params) => {
	return await GatewayDao.updateUpstream(dbObj,params);
};
GatewayService.deleteUpstream = async (dbObj,f_id, filter_uid) => {
	return await GatewayDao.deleteUpstream(dbObj,f_id, filter_uid);
};
GatewayService.getUpstreamById = async (dbObj,f_id, filter_uid) => {
	return await GatewayDao.getUpstreamById(dbObj,f_id, filter_uid);
};

GatewayService.getHttpRouterList = async (dbObj,f_station_id, filter_uid) => {
	return await GatewayDao.getHttpRouterList(dbObj,f_station_id, filter_uid);
};
GatewayService.addHttpRouter = async (dbObj,params) => {
	params.f_server_name = params.f_server_name || "";
	return await GatewayDao.addHttpRouter(dbObj,params);
};
GatewayService.updateHttpRouter = async (dbObj,params) => {
	params.f_server_name = params.f_server_name || "";
	return await GatewayDao.updateHttpRouter(dbObj,params);
};
GatewayService.deleteHttpRouter = async (dbObj,f_id, filter_uid) => {
	return await GatewayDao.deleteHttpRouter(dbObj,f_id, filter_uid);
};
GatewayService.getHttpRouterById = async (dbObj,f_id, filter_uid) => {
	return await GatewayDao.getHttpRouterById(dbObj,f_id, filter_uid);
};

GatewayService.addBWList = async (dbObj,params, type, filter_uid) => {
	return await GatewayDao.addBWList(dbObj,params, type, filter_uid);	
}
GatewayService.getBWList = async (dbObj,f_station_id, type, filter_uid) => {
	return await GatewayDao.getBWList(dbObj,f_station_id, type, filter_uid);
};
GatewayService.deleteBWList = async (dbObj,f_id, type, filter_uid) => {
	return await GatewayDao.deleteBWList(dbObj,f_id, type, filter_uid);
};
GatewayService.getFlowControl = async (dbObj,f_station_id, filter_uid) => {
	return await GatewayDao.getFlowControl(dbObj,f_station_id, filter_uid);
};
GatewayService.upsertFlowControl = async (dbObj,params) => {
	return await GatewayDao.upsertFlowControl(dbObj,params);
};
module.exports = GatewayService;