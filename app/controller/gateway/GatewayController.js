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
const GatewayService = require('../../service/gateway/GatewayService');
const AdminService = require('../../service/admin/AdminService');
const _ = require('lodash');
const util = require('../../tools/util');

const stationStruct = {
	f_id: '',
	f_station_id: '',
	f_name_cn: '',
	f_monitor_url: '',
	f_valid: 1,
	f_update_person: '',
	f_update_time: {formatter: util.formatTimeStamp}
};

const upstreamStruct = {
	f_id: '',
	f_upstream: '',
	f_addr: '',
	f_weight: 1,
	f_fusing_onoff: 1,
	f_valid: 1,
	f_update_person: '',
	f_update_time: {formatter: util.formatTimeStamp}
};

const httpRouterStruct = {
	f_id: '',
	f_station_id: '',
	f_server_name: '',
	f_path_rule: '',
	f_proxy_pass: '',
	f_valid: 1,
	f_update_person: '',
	f_update_time: {formatter: util.formatTimeStamp}
};

const bwListStruct = {
	f_id: '',
	f_station_id: '',
	f_ip: '',
	f_valid: 1,
	f_update_person: '',
	f_update_time: {formatter: util.formatTimeStamp}
}

const flowControlStruct = {
	f_id: '',
	f_station_id: '',
	f_duration: 60,
	f_max_flow: 0,
	f_valid: 1,
	f_update_person: '',
	f_update_time: {formatter: util.formatTimeStamp}
}

const GatewayController = {};

GatewayController.getStationList = async (ctx) => {
	try {
		let f_station_id = ctx.paramsObj.f_station_id || '';
		let f_name_cn = ctx.paramsObj.f_name_cn || '';
		ctx.makeResObj(200, '', util.viewFilter(await GatewayService.getStationList(f_station_id, f_name_cn), stationStruct));
	} catch (e) {
		logger.error('[getStationList]', e, ctx);
		ctx.makeErrResObj();
	}
};

GatewayController.addStation = async (ctx) => {
	try {
		let params = ctx.paramsObj;
		params.uid = ctx.uid
		ctx.makeResObj(200, '', util.viewFilter(await GatewayService.addStation(params), stationStruct));
	} catch (e) {
		logger.error('[addStation]', e, ctx);
		if(e.name == "SequelizeUniqueConstraintError"){
			ctx.makeResObj(400, "#common.mustUnique#");
		} else {
			ctx.makeErrResObj();
		}
	}
};

GatewayController.updateStation = async (ctx) => {
	try {
		let params = ctx.paramsObj;
		params.uid = ctx.uid
		await GatewayService.updateStation(params);
		ctx.makeResObj(200, '', util.viewFilter(await GatewayService.getStationById(params.f_id), stationStruct));
	} catch (e) {
		logger.error('[updateStation]', e, ctx);
		ctx.makeErrResObj();
	}
};

GatewayController.deleteStation = async (ctx) => {
	try {
		let f_id = ctx.paramsObj.f_id;
		await GatewayService.deleteStation(f_id);
		ctx.makeResObj(200, '', [f_id]);
	} catch (e) {
		logger.error('[deleteStation]', e, ctx);
		ctx.makeErrResObj();
	}
};

GatewayController.getUpstreamList = async (ctx) => {
	try {
		let f_upstream = ctx.paramsObj.f_upstream || '';
		ctx.makeResObj(200, '', util.viewFilter(await GatewayService.getUpstreamList(f_upstream), upstreamStruct));
	} catch (e) {
		logger.error('[getUpstreamList]', e, ctx);
		ctx.makeErrResObj();
	}
};

GatewayController.addUpstream = async (ctx) => {
	try {
		let params = ctx.paramsObj;
		params.uid = ctx.uid
		ctx.makeResObj(200, '', util.viewFilter(await GatewayService.addUpstream(params), upstreamStruct));
	} catch (e) {
		logger.error('[addUpstream]', e, ctx);
		ctx.makeErrResObj();
	}
};

GatewayController.updateUpstream = async (ctx) => {
	try {
		let params = ctx.paramsObj;
		params.uid = ctx.uid
		await GatewayService.updateUpstream(params);
		ctx.makeResObj(200, '', util.viewFilter(await GatewayService.getUpstreamById(params.f_id), upstreamStruct));
	} catch (e) {
		logger.error('[updateUpstream]', e, ctx);
		ctx.makeErrResObj();
	}
};

GatewayController.deleteUpstream = async (ctx) => {
	try {
		let f_id = ctx.paramsObj.f_id;
		let deleteNum = await GatewayService.deleteUpstream(f_id);
		if(deleteNum == 1){
			ctx.makeResObj(200, '', [f_id]);
		} else {
			ctx.makeResObj(400, '#gateway.delete.deleteUpstreamErrorTip#', [f_id]);
		}
	} catch (e) {
		logger.error('[deleteUpstream]', e, ctx);
		ctx.makeErrResObj();
	}
};

GatewayController.getHttpRouterList = async (ctx) => {
	try {
		let f_station_id = ctx.paramsObj.f_station_id || '';
		ctx.makeResObj(200, '', util.viewFilter(await GatewayService.getHttpRouterList(f_station_id), httpRouterStruct));
	} catch (e) {
		logger.error('[getHttpRouterList]', e, ctx);
		ctx.makeErrResObj();
	}
};

GatewayController.addHttpRouter = async (ctx) => {
	try {
		let params = ctx.paramsObj;
		params.uid = ctx.uid
		ctx.makeResObj(200, '', util.viewFilter(await GatewayService.addHttpRouter(params), httpRouterStruct));
	} catch (e) {
		logger.error('[addHttpRouter]', e, ctx);
		ctx.makeErrResObj();
	}
};

GatewayController.updateHttpRouter = async (ctx) => {
	try {
		let params = ctx.paramsObj;
		params.uid = ctx.uid
		await GatewayService.updateHttpRouter(params);
		ctx.makeResObj(200, '', util.viewFilter(await GatewayService.getHttpRouterById(params.f_id), httpRouterStruct));
	} catch (e) {
		logger.error('[updateHttpRouter]', e, ctx);
		ctx.makeErrResObj();
	}
};

GatewayController.deleteHttpRouter = async (ctx) => {
	try {
		let f_id = ctx.paramsObj.f_id;
		await GatewayService.deleteHttpRouter(f_id);
		ctx.makeResObj(200, '', [f_id]);
	} catch (e) {
		logger.error('[deleteHttpRouter]', e, ctx);
		ctx.makeErrResObj();
	}
};

GatewayController.addBWList = async (ctx) => {
	try {
		let params = ctx.paramsObj;
		params.uid = ctx.uid
		params.f_station_id = params.f_station_id || ''
		ctx.makeResObj(200, '', util.viewFilter(await GatewayService.addBWList(params, params.type), bwListStruct));
	} catch (e) {
		logger.error('[addBWList]', e, ctx);
		if(e.name == "SequelizeUniqueConstraintError"){
			ctx.makeResObj(400, "#common.mustUnique#");
		} else {
			ctx.makeErrResObj();
		}
	}
};

GatewayController.getBWList = async (ctx) => {
	try {
		let f_station_id = ctx.paramsObj.f_station_id || '';
		let type = ctx.paramsObj.type || '';
		ctx.makeResObj(200, '', util.viewFilter(await GatewayService.getBWList(f_station_id, type), bwListStruct));
	} catch (e) {
		logger.error('[getBWList]', e, ctx);
		ctx.makeErrResObj();
	}
};

GatewayController.deleteBWList = async (ctx) => {
	try {
		let f_id = ctx.paramsObj.f_id;
		let type = ctx.paramsObj.type || '';
		await GatewayService.deleteBWList(f_id, type);
		ctx.makeResObj(200, '', [f_id]);
	} catch (e) {
		logger.error('[deleteBWList]', e, ctx);
		ctx.makeErrResObj();
	}
};

GatewayController.getFlowControl = async (ctx) => {
	try {
		let f_station_id = ctx.paramsObj.f_station_id || '';
		ctx.makeResObj(200, '', util.viewFilter(await GatewayService.getFlowControl(f_station_id), flowControlStruct));
	} catch (e) {
		logger.error('[getFlowControl]', e, ctx);
		ctx.makeErrResObj();
	}
};

GatewayController.upsertFlowControl = async (ctx) => {
	try {
		let params = ctx.paramsObj;
		params.uid = ctx.uid
		ctx.makeResObj(200, '', util.viewFilter(await GatewayService.upsertFlowControl(params), flowControlStruct));
	} catch (e) {
		logger.error('[upsertFlowControl]', e, ctx);
		ctx.makeErrResObj();
	}
};

module.exports = GatewayController;