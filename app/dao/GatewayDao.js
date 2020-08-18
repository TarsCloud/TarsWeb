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

//const {tStation, tUpstream, tHttpRouter, tFlowControl, tBlacklist, tWhitelist, sequelize:seq} = require('./db').db_base;
const {tGatewayObj} = require('./db').db_tars_web;
const Sequelize = require('sequelize');

const GatewayDao = {};

class UidFilter{
	constructor(filter_uid){
		this.filter_uid = filter_uid
	}
	where(where){
		if(!this.filter_uid) return where
		where.f_update_person = this.filter_uid
		return where
	}
	async hasAuth(f_station_id){
		if(!this.filter_uid) return true
		let station = await tStation.findOne({
			where:{
				f_station_id: f_station_id,
				f_update_person: this.filter_uid
			}
		})
		return !!station
	}
}
GatewayDao.upsertGatewayObj = async(user, gatewayObj)=>{
	return await tGatewayObj.upsert({
		obj: gatewayObj,
		update_person: user
	})
}
GatewayDao.deleteGatewayObj = async(user, gatewayObj)=>{
	return await tGatewayObj.destroy({
		where:{
			obj: gatewayObj,
			update_person: user
		}
	})
}
GatewayDao.getGatewayObjList = async ()=>{
	let rows =  await tGatewayObj.findAll({
		attributes:["obj"]
	})
	return rows.map((row)=>{
		return row.obj
	})
}

GatewayDao.addStation = async (dbObj, params) => {
	let {tStation} = dbObj
	return await tStation.create({
		f_station_id: params.f_station_id,
		f_name_cn: params.f_name_cn,
		f_monitor_url: params.f_monitor_url || "",
		f_update_person: params.uid
	});
};

GatewayDao.updateStation = async (dbObj, params) => {
	let {tStation} = dbObj
	let filter = new UidFilter(params.filter_uid)
	return await tStation.update({
		f_station_id: params.f_station_id,
		f_name_cn: params.f_name_cn,
		f_monitor_url: params.f_monitor_url || "",
		f_update_person: params.uid
	}, {
		where: filter.where({
			f_id: params.f_id
		})
	});
};

GatewayDao.deleteStation = async (dbObj, f_id, filter_uid) => {
	let {tStation, tHttpRouter, tFlowControl, tBlacklist, tWhitelist, seq} = dbObj
	let transaction = await seq.transaction()
	try{
		let filter = new UidFilter(filter_uid)
		let station = await tStation.findOne({where:filter.where({f_id: f_id}), transaction})
		if(!station){
			await trasaction.rollback()
			return 0
		}
		await tHttpRouter.update({f_valid: 0},{where:filter.where({
			f_station_id: station.f_station_id
		}), transaction})
		await tFlowControl.update({f_valid: 0},{where:filter.where({
			f_station_id: station.f_station_id
		}), transaction})
		await tBlacklist.update({f_valid: 0},{where:filter.where({
			f_station_id: station.f_station_id
		}), transaction})
		await tWhitelist.update({f_valid: 0},{where:filter.where({
			f_station_id: station.f_station_id
		}), transaction})
		station.f_valid = 0
		await station.save({transaction})
		await transaction.commit()
		return 1
	} catch(e){
		await transaction.rollback()
		return 0
	}	
};

GatewayDao.getStationById = async (dbObj, f_id, filter_uid) => {
	let {tStation} = dbObj
	let filter = new UidFilter(filter_uid)
	return await tStation.findOne({
		where: filter.where({
			f_id,
			f_valid: 1
		})
	});
};

GatewayDao.getStationList = async (dbObj, f_station_id, f_name_cn, filter_uid) => {
	let {tStation} = dbObj
	let filter = new UidFilter(filter_uid)
	return await tStation.findAll({
		where: filter.where({
			f_station_id: {
				[Sequelize.Op.like]: '%' + f_station_id + '%'
			},
			f_name_cn: {
				[Sequelize.Op.like]: '%' + f_name_cn + '%'
			},
			f_valid: 1
		})
	});
};

GatewayDao.addUpstream = async (dbObj, params) => {
	let {tUpstream} = dbObj
	return await tUpstream.create({
		f_upstream: params.f_upstream,
		f_addr: params.f_addr,
		f_weight: params.f_weight,
		f_fusing_onoff: params.f_fusing_onoff,
		f_update_person: params.uid
	});
};

GatewayDao.updateUpstream = async (dbObj, params) => {
	let {tUpstream} = dbObj
	let filter = new UidFilter(params.filter_uid)
	return await tUpstream.update({
		f_upstream: params.f_upstream,
		f_addr: params.f_addr,
		f_weight: params.f_weight,
		f_fusing_onoff: params.f_fusing_onoff,
		f_update_person: params.uid
	}, {
		where: filter.where({
			f_id: params.f_id
		})
	});
};

GatewayDao.deleteUpstream = async (dbObj, f_id, filter_uid) => {
	let {tUpstream,  tHttpRouter} = dbObj
	try{
		let filter = new UidFilter(filter_uid)
		let upstream = await tUpstream.findOne({where:filter.where({f_id: f_id, f_valid: 1})})
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

GatewayDao.getUpstreamById = async (dbObj, f_id, filter_uid) => {
	let {tUpstream} = dbObj
	let filter = new UidFilter(filter_uid)
	return await tUpstream.findOne({
		where: filter.where({
			f_id,
			f_valid: 1
		})
	});
};

GatewayDao.getUpstreamList = async (dbObj, f_upstream, filter_uid) => {
	let {tUpstream} = dbObj
	let filter = new UidFilter(filter_uid)
	return await tUpstream.findAll({
		where: filter.where({
			f_upstream: {
				[Sequelize.Op.like]: '%' + f_upstream + '%'
			},
			f_valid: 1
		})
	});
};

GatewayDao.addHttpRouter = async (dbObj, params) => {
	let {tHttpRouter} = dbObj
	//判断是否有权限操作站点
	if(params.f_station_id){
		let filter = new UidFilter(params.filter_uid)
		let hasAuth = await filter.hasAuth(params.f_station_id)
		if(!hasAuth) throw new Error(`${params.filter_uid} has no auth to add bwlist to station ${params.f_station_id}`)
	}
	return await tHttpRouter.create({
		f_station_id: params.f_station_id,
		f_server_name: params.f_server_name,
		f_path_rule: params.f_path_rule,
		f_proxy_pass: params.f_proxy_pass,
		f_update_person: params.uid
	});
};

GatewayDao.updateHttpRouter = async (dbObj, params) => {
	let {tHttpRouter} = dbObj
	let filter = new UidFilter(params.filter_uid)
	return await tHttpRouter.update({
		f_station_id: params.f_station_id,
		f_server_name: params.f_server_name,
		f_path_rule: params.f_path_rule,
		f_proxy_pass: params.f_proxy_pass,
		f_update_person: params.uid
	}, {
		where: filter.where({
			f_id: params.f_id
		})
	});
};

GatewayDao.deleteHttpRouter = async (dbObj, f_id, filter_uid) => {
	let {tHttpRouter} = dbObj
	let filter = new UidFilter(filter_uid)
	try{
		await tHttpRouter.update({f_valid: 0},{
			where:filter.where({
				f_id
			})
		})
		return 1
	} catch(e){
		return 0
	}	
};
GatewayDao.getHttpRouterById = async (dbObj, f_id, filter_uid) => {
	let {tHttpRouter} = dbObj
	let filter = new UidFilter(filter_uid)
	return await tHttpRouter.findOne({
		where: filter.where({
			f_id,
			f_valid: 1
		})
	});
};

GatewayDao.getHttpRouterList = async (dbObj, f_station_id, filter_uid) => {
	let {tHttpRouter} = dbObj
	let filter = new UidFilter(filter_uid)
	return await tHttpRouter.findAll({
		where: filter.where({
			f_station_id,
			f_valid: 1
		})
	});
};

GatewayDao.addBWList = async(dbObj, params, type) => {
	let {tBlacklist, tWhitelist} = dbObj
	let model = type == "black" ? tBlacklist : tWhitelist
	//判断是否有权限操作站点
	if(params.f_station_id){
		let filter = new UidFilter(params.filter_uid)
		let hasAuth = await filter.hasAuth(params.f_station_id)
		if(!hasAuth) throw new Error(`${params.filter_uid} has no auth to add bwlist to station ${params.f_station_id}`)
	}
	return await model.upsert({
		f_station_id: params.f_station_id,
		f_ip: params.f_ip,
		f_update_person: params.uid,
		f_valid:1
	});
}

GatewayDao.getBWList = async(dbObj, f_station_id, type, filter_uid) => {
	let {tBlacklist, tWhitelist} = dbObj
	let filter = new UidFilter(filter_uid)
	let model = type == "black" ? tBlacklist : tWhitelist
	return await model.findAll({
		where:filter.where({
			f_station_id,
			f_valid: 1
		})
	})
}

GatewayDao.deleteBWList = async(dbObj, f_id, type, filter_uid) => {
	let {tBlacklist, tWhitelist} = dbObj
	let filter = new UidFilter(filter_uid)
	let model = type == "black" ? tBlacklist : tWhitelist
	return await model.update({
		f_id: f_id,
		f_valid: 0
	}, {where:filter.where({
		f_id: f_id
	})})
}

GatewayDao.getFlowControl = async(dbObj, f_station_id, filter_uid) => {
	let {tFlowControl} = dbObj
	let filter = new UidFilter(filter_uid)
	return await tFlowControl.findOne({
		where:filter.where({
			f_station_id: f_station_id
		})
	})
}

GatewayDao.upsertFlowControl = async (dbObj, params)=>{
	let {tFlowControl} = dbObj
	let filter = new UidFilter(params.filter_uid)
	return await tFlowControl.upsert({
		f_station_id: params.f_station_id,
		f_duration: params.f_duration,
		f_max_flow: params.f_max_flow,
		f_update_person: params.uid
	}, {where:filter.where({
		f_station_id: params.f_station_id
	})})
}

module.exports = GatewayDao;
