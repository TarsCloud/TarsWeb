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
const gatewayObjManager = require('../../service/gateway/GatewayObjManager');
const AuthService = require('../../service/auth/AuthService');

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

/**
 * 查询gateway数据时，若有admin权限，可访问所有数据，否则只能访问自己的。调用此函数决定是否设置过滤uid。
 * @param {*} ctx 
 * @param {*} params 
 */
async function getFilterUid(ctx){
	let hasAdminAuth = await AuthService.hasAdminAuth(ctx.uid);
	if(hasAdminAuth) return null;
	return ctx.uid;
}

const GatewayController = {};

//新增gatewayObj
GatewayController.addGatewayObj = async(ctx)=>{
	//此接口必须附带gatewayObj，中间件中会判断obj是否合法，合法则写入db，请求到达此处时已经新增成功
	ctx.makeResObj(200, '')
}
//获取gatewayObj list
GatewayController.getGatewayObjList = async(ctx)=>{
	let objs = await gatewayObjManager.getGatewayObjList()
	ctx.makeResObj(200, '', objs)
}
//删除gatewayObj
GatewayController.deleteGatewayObj = async(ctx)=>{
	let objs = await gatewayObjManager.deleteGatewayObj(ctx.uid, ctx.paramsObj.gatewayObj)
	ctx.makeResObj(200, '', objs)
}

GatewayController.getStationList = async (ctx) => {
	try {
		let f_station_id = ctx.paramsObj.f_station_id || '';
		let f_name_cn = ctx.paramsObj.f_name_cn || '';
		let filter_uid = await getFilterUid(ctx)
		ctx.makeResObj(200, '', util.viewFilter(await GatewayService.getStationList(ctx.dbObj, f_station_id, f_name_cn, filter_uid), stationStruct));
	} catch (e) {
		logger.error('[getStationList]', e, ctx);
		ctx.makeErrResObj();
	}
};

GatewayController.addStation = async (ctx) => {
	try {
		let params = ctx.paramsObj;
		params.uid = ctx.uid
		ctx.makeResObj(200, '', util.viewFilter(await GatewayService.addStation(ctx.dbObj, params), stationStruct));
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
		let filter_uid = await getFilterUid(ctx)
		params.filter_uid = filter_uid
		await GatewayService.updateStation(ctx.dbObj, params);
		ctx.makeResObj(200, '', util.viewFilter(await GatewayService.getStationById(ctx.dbObj, params.f_id), stationStruct));
	} catch (e) {
		logger.error('[updateStation]', e, ctx);
		ctx.makeErrResObj();
	}
};

GatewayController.deleteStation = async (ctx) => {
	try {
		let f_id = ctx.paramsObj.f_id;
		let filter_uid = await getFilterUid(ctx)
		await GatewayService.deleteStation(ctx.dbObj, f_id, filter_uid);
		ctx.makeResObj(200, '', [f_id]);
	} catch (e) {
		logger.error('[deleteStation]', e, ctx);
		ctx.makeErrResObj();
	}
};

GatewayController.getUpstreamList = async (ctx) => {
	try {
		let f_upstream = ctx.paramsObj.f_upstream || '';
		let filter_uid = await getFilterUid(ctx)
		ctx.makeResObj(200, '', util.viewFilter(await GatewayService.getUpstreamList(ctx.dbObj, f_upstream, filter_uid), upstreamStruct));
	} catch (e) {
		logger.error('[getUpstreamList]', e, ctx);
		ctx.makeErrResObj();
	}
};

GatewayController.addUpstream = async (ctx) => {
	try {
		let params = ctx.paramsObj;
		params.uid = ctx.uid
		ctx.makeResObj(200, '', util.viewFilter(await GatewayService.addUpstream(ctx.dbObj, params), upstreamStruct));
	} catch (e) {
		logger.error('[addUpstream]', e, ctx);
		ctx.makeErrResObj();
	}
};

GatewayController.updateUpstream = async (ctx) => {
	try {
		let params = ctx.paramsObj;
		params.uid = ctx.uid
		let filter_uid = await getFilterUid(ctx)
		params.filter_uid = filter_uid
		await GatewayService.updateUpstream(ctx.dbObj, params);
		ctx.makeResObj(200, '', util.viewFilter(await GatewayService.getUpstreamById(ctx.dbObj, params.f_id), upstreamStruct));
	} catch (e) {
		logger.error('[updateUpstream]', e, ctx);
		ctx.makeErrResObj();
	}
};

GatewayController.deleteUpstream = async (ctx) => {
	try {
		let f_id = ctx.paramsObj.f_id;
		let filter_uid = await getFilterUid(ctx)
		let deleteNum = await GatewayService.deleteUpstream(ctx.dbObj, f_id, filter_uid);
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
		let filter_uid = await getFilterUid(ctx)
		ctx.makeResObj(200, '', util.viewFilter(await GatewayService.getHttpRouterList(ctx.dbObj, f_station_id, filter_uid), httpRouterStruct));
	} catch (e) {
		logger.error('[getHttpRouterList]', e, ctx);
		ctx.makeErrResObj();
	}
};

GatewayController.addHttpRouter = async (ctx) => {
	try {
		let params = ctx.paramsObj;
		params.uid = ctx.uid
		let filter_uid = await getFilterUid(ctx)
		params.filter_uid = filter_uid
		ctx.makeResObj(200, '', util.viewFilter(await GatewayService.addHttpRouter(ctx.dbObj, params), httpRouterStruct));
	} catch (e) {
		logger.error('[addHttpRouter]', e, ctx);
		if(e.name == "SequelizeUniqueConstraintError"){
			ctx.makeResObj(400, "#common.mustUnique#");
		} else {
			ctx.makeErrResObj();
		}
	}
};

GatewayController.updateHttpRouter = async (ctx) => {
	try {
		let params = ctx.paramsObj;
		params.uid = ctx.uid
		let filter_uid = await getFilterUid(ctx)
		params.filter_uid = filter_uid
		await GatewayService.updateHttpRouter(ctx.dbObj, params);
		ctx.makeResObj(200, '', util.viewFilter(await GatewayService.getHttpRouterById(ctx.dbObj, params.f_id), httpRouterStruct));
	} catch (e) {
		logger.error('[updateHttpRouter]', e, ctx);
		ctx.makeErrResObj();
	}
};

GatewayController.deleteHttpRouter = async (ctx) => {
	try {
		let f_id = ctx.paramsObj.f_id;
		let filter_uid = await getFilterUid(ctx)
		await GatewayService.deleteHttpRouter(ctx.dbObj, f_id, filter_uid);
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
		let filter_uid = await getFilterUid(ctx)
		params.filter_uid = filter_uid
		ctx.makeResObj(200, '', util.viewFilter(await GatewayService.addBWList(ctx.dbObj, params, params.type), bwListStruct));
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
		let filter_uid = await getFilterUid(ctx)
		ctx.makeResObj(200, '', util.viewFilter(await GatewayService.getBWList(ctx.dbObj, f_station_id, type, filter_uid), bwListStruct));
	} catch (e) {
		logger.error('[getBWList]', e, ctx);
		ctx.makeErrResObj();
	}
};

GatewayController.deleteBWList = async (ctx) => {
	try {
		let f_id = ctx.paramsObj.f_id;
		let type = ctx.paramsObj.type || '';
		let filter_uid = await getFilterUid(ctx)
		await GatewayService.deleteBWList(ctx.dbObj, f_id, type, filter_uid);
		ctx.makeResObj(200, '', [f_id]);
	} catch (e) {
		logger.error('[deleteBWList]', e, ctx);
		ctx.makeErrResObj();
	}
};

GatewayController.getFlowControl = async (ctx) => {
	try {
		let f_station_id = ctx.paramsObj.f_station_id || '';
		let filter_uid = await getFilterUid(ctx)
		ctx.makeResObj(200, '', util.viewFilter(await GatewayService.getFlowControl(ctx.dbObj, f_station_id, filter_uid), flowControlStruct));
	} catch (e) {
		logger.error('[getFlowControl]', e, ctx);
		ctx.makeErrResObj();
	}
};

GatewayController.upsertFlowControl = async (ctx) => {
	try {
		let params = ctx.paramsObj;
		params.uid = ctx.uid
		let filter_uid = await getFilterUid(ctx)
		params.filter_uid = filter_uid
		ctx.makeResObj(200, '', util.viewFilter(await GatewayService.upsertFlowControl(ctx.dbObj, params), flowControlStruct));
	} catch (e) {
		logger.error('[upsertFlowControl]', e, ctx);
		ctx.makeErrResObj();
	}
};

module.exports = GatewayController;