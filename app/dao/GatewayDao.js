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

const {tProfileTemplate, tStation, tUpstream, tHttpRouter, tFlowControl, tBlacklist, tWhitelist, sequelize:seq} = require('./db').db_base;
const Sequelize = require('sequelize');

const GatewayDao = {};

GatewayDao.addStation = async (params) => {
	return await tStation.create({
		f_station_id: params.f_station_id,
		f_name_cn: params.f_name_cn,
		f_monitor_url: params.f_monitor_url || "",
		f_update_person: params.uid
	});
};

GatewayDao.updateStation = async (params) => {
	return await tStation.update({
		f_station_id: params.f_station_id,
		f_name_cn: params.f_name_cn,
		f_monitor_url: params.f_monitor_url || "",
		f_update_person: params.uid
	}, {
		where: {
			f_id: params.f_id
		}
	});
};

GatewayDao.deleteStation = async (f_id) => {
	let transaction = await seq.transaction()
	try{
		let station = await tStation.findOne({where:{f_id: f_id}, transaction})
		if(!station){
			await trasaction.rollback()
			return 0
		}
		await tHttpRouter.update({f_valid: 0},{where:{
			f_station_id: station.f_station_id
		}, transaction})
		await tFlowControl.update({f_valid: 0},{where:{
			f_station_id: station.f_station_id
		}, transaction})
		await tBlacklist.update({f_valid: 0},{where:{
			f_station_id: station.f_station_id
		}, transaction})
		await tWhitelist.update({f_valid: 0},{where:{
			f_station_id: station.f_station_id
		}, transaction})
		station.f_valid = 0
		await station.save({transaction})
		await transaction.commit()
		return 1
	} catch(e){
		await transaction.rollback()
		return 0
	}	
};

GatewayDao.getStationById = async (f_id) => {
	return await tStation.findOne({
		where: {
			f_id,
			f_valid: 1
		}
	});
};

GatewayDao.getStationList = async (f_station_id, f_name_cn) => {
	return await tStation.findAll({
		where: {
			f_station_id: {
				[Sequelize.Op.like]: '%' + f_station_id + '%'
			},
			f_name_cn: {
				[Sequelize.Op.like]: '%' + f_name_cn + '%'
			},
			f_valid: 1
		}
	});
};

GatewayDao.addUpstream = async (params) => {
	return await tUpstream.create({
		f_upstream: params.f_upstream,
		f_addr: params.f_addr,
		f_weight: params.f_weight,
		f_fusing_onoff: params.f_fusing_onoff,
		f_update_person: params.uid
	});
};

GatewayDao.updateUpstream = async (params) => {
	return await tUpstream.update({
		f_upstream: params.f_upstream,
		f_addr: params.f_addr,
		f_weight: params.f_weight,
		f_fusing_onoff: params.f_fusing_onoff,
		f_update_person: params.uid
	}, {
		where: {
			f_id: params.f_id
		}
	});
};

GatewayDao.deleteUpstream = async (f_id) => {
	try{
		let upstream = await tUpstream.findOne({where:{f_id: f_id, f_valid: 1}})
		if(!upstream){
			return 0
		}
		let routersNum = await tHttpRouter.count({
			where:{
				f_proxy_pass: upstream.f_upstream,
				f_valid: 1
			}
		})
		//有关联的router，不能删除
		if(routersNum > 0){
			return 0
		}
		upstream.f_valid = 0
		await upstream.save()
		return 1
	} catch(e){
		return 0
	}	
};

GatewayDao.getUpstreamById = async (f_id) => {
	return await tUpstream.findOne({
		where: {
			f_id,
			f_valid: 1
		}
	});
};

GatewayDao.getUpstreamList = async (f_upstream) => {
	return await tUpstream.findAll({
		where: {
			f_upstream: {
				[Sequelize.Op.like]: '%' + f_upstream + '%'
			},
			f_valid: 1
		}
	});
};

GatewayDao.addHttpRouter = async (params) => {
	return await tHttpRouter.create({
		f_station_id: params.f_station_id,
		f_server_name: params.f_server_name,
		f_path_rule: params.f_path_rule,
		f_proxy_pass: params.f_proxy_pass,
		f_update_person: params.uid
	});
};

GatewayDao.updateHttpRouter = async (params) => {
	return await tHttpRouter.update({
		f_station_id: params.f_station_id,
		f_server_name: params.f_server_name,
		f_path_rule: params.f_path_rule,
		f_proxy_pass: params.f_proxy_pass,
		f_update_person: params.uid
	}, {
		where: {
			f_id: params.f_id
		}
	});
};

GatewayDao.deleteHttpRouter = async (f_id) => {
	try{
		await tHttpRouter.update({f_valid: 0},{
			where:{
				f_id
			}
		})
		return 1
	} catch(e){
		return 0
	}	
};
GatewayDao.getHttpRouterById = async (f_id) => {
	return await tHttpRouter.findOne({
		where: {
			f_id,
			f_valid: 1
		}
	});
};

GatewayDao.getHttpRouterList = async (f_station_id) => {
	return await tHttpRouter.findAll({
		where: {
			f_station_id,
			f_valid: 1
		}
	});
};

GatewayDao.addBWList = async(params, type) => {
	let model = type == "black" ? tBlacklist : tWhitelist
	return await model.upsert({
		f_station_id: params.f_station_id,
		f_ip: params.f_ip,
		f_update_person: params.uid,
		f_valid:1
	});
}

GatewayDao.getBWList = async(f_station_id, type) => {
	let model = type == "black" ? tBlacklist : tWhitelist
	return await model.findAll({
		where:{
			f_station_id,
			f_valid: 1
		}
	})
}

GatewayDao.deleteBWList = async(f_id, type) => {
	let model = type == "black" ? tBlacklist : tWhitelist
	return await model.update({
		f_id: f_id,
		f_valid: 0
	}, {where:{
		f_id: f_id
	}})
}

GatewayDao.getFlowControl = async(f_station_id) => {
	return await tFlowControl.findOne({
		where:{
			f_station_id: f_station_id
		}
	})
}

GatewayDao.upsertFlowControl = async (params)=>{
	return await tFlowControl.upsert({
		f_station_id: params.f_station_id,
		f_duration: params.f_duration,
		f_max_flow: params.f_max_flow,
		f_update_person: params.uid
	}, {where:{
		f_station_id: params.f_station_id
	}})
}

module.exports = GatewayDao;
