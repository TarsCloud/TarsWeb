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

const uuid = require("uuid");
const logger = require('../../../logger');
const WebConf = require('../../../config/webConf');
const { monitorQueryStruct } = require('../../../rpc/struct');
function getPropertyQueryPrx(k8s) {
	if (k8s == "true") {
		return require('../../../rpc/k8s').propertyQueryPrx;
	} else {
		return require('../../../rpc').propertyQueryPrx;
	}
}

const MonitorPropertyService = {};

MonitorPropertyService.getData = async (params) => {
	let theData = new Map(), preData = new Map()
	// if(params.userpc == "1"){
		theData = await callRpc(params, true)
		preData = await callRpc(params, false)
	// } else {
	// 	theData = await call(params, true)
	// 	preData = await call(params, false)
	// }
	return merge(params, theData, preData);
};

async function callRpc(params, the) {
	let date = the ? params.thedate : params.predate,
		conditions = [],
		startshowtime = params.startshowtime || '0000',
		endshowtime = params.endshowtime || '2360';
	let req = new monitorQueryStruct.MonitorQueryReq();
	req.uid = uuid.v1()
	req.dataid = "tars_property_1"
	req.indexs.readFromObject(['value'])

	req.date = date;
	req.tflag1 = startshowtime;
	req.tflag2 = endshowtime;

	// conditions.push({ field: "f_date", op: monitorQueryStruct.OP.EQ, val:Mysql.escape(date) })
	// conditions.push({ field: "f_tflag", op: monitorQueryStruct.OP.GTE, val:Mysql.escape(startshowtime) })
	// conditions.push({ field: "f_tflag", op: monitorQueryStruct.OP.LTE, val:Mysql.escape(endshowtime) })

	if (params.master_name) {
		conditions.push({ field: "master_name", op: monitorQueryStruct.OP.LIKE, val:params.master_name })
	}
	if (params.master_ip) {
		conditions.push({ field: "master_ip", op: monitorQueryStruct.OP.LIKE, val:params.master_ip })
	}
	if (params.property_name) {
		conditions.push({ field: "property_name", op: monitorQueryStruct.OP.LIKE, val:params.property_name })
	}
	if (params.policy) {
		conditions.push({ field: "policy", op: monitorQueryStruct.OP.LIKE, val:params.policy })
	}

	req.conditions.readFromObject(conditions)

	req.groupby.readFromObject(params.group_by ? [params.group_by_first || 'f_date', params.group_by] : ['f_tflag'])
	// req.groupby.readFromObject(params.group_by ? ['f_date', params.group_by] : ['f_tflag'])

	let data = await getPropertyQueryPrx(params.k8s).query(req)
	let rsp = data.rsp

	// console.log(rsp);

	let map = new Map()

	if(data.__return !=0 ||  rsp.ret != 0)
	{
		return map;
		// throw new Error(`query ${date} property info code:${data.__return}, ret: ${rsp.ret}, msg: ${rsp.msg}`)
	}
	// console.log(data.rsp);
	for(let key in rsp.result){
		map.set(key, rsp.result[key])
	}
	return map
}

function merge(params, theData, preData) {
	let result = [];
	let set = mergeKey(params, theData, preData);
	for (let item of set) {
		let thevalue = theData.get(item),
			prevalue = preData.get(item),
			thevalueOutput = formatValue(thevalue),
			prevalueOutput = formatValue(prevalue);


		let tmpObj = {
			property_name: params.property_name || '%',
			master_ip: params.master_ip || '%',
			master_name: params.master_name || '%',
			policy: params.policy || '%',

			the_value: thevalueOutput[0],
			pre_value: prevalueOutput[0]
		};

		// let groupby = params.group_by ? ['f_date', params.group_by] : ['f_tflag'];
		let groupby = params.group_by ? [params.group_by_first || 'f_date', params.group_by] : ['f_tflag'];

		for (let i = 0; i < groupby.length; i++) {
			let callGroup = groupby[i],
				key = item.split(','),
				callGroupValue = key[i];

			switch (callGroup) {
				case 'f_date' :
					tmpObj.show_date = callGroupValue;
					break;
				case 'f_tflag' :
					tmpObj.show_time = callGroupValue;
					break;
				case 'master_name' :
					tmpObj.master_name = callGroupValue;
					break;
				case 'property_name' :
					tmpObj.property_name = callGroupValue;
					break;
				case 'policy' :
					tmpObj.policy = callGroupValue;
					break;
				case 'master_ip' :
					tmpObj.master_ip = callGroupValue;
					break;
			}
		}
		result.push(tmpObj);
	}
	return result;
}

function mergeKey(params, theData, preData) {
	let set = new Set();

	for (let key of theData.keys()) {
		set.add(key);
	}

	let preKeys = preData.keys()
	for (let preKey of preKeys) {
		let key = preKey.split(',');
		if (key.length > 1 && (!params.group_by_first || params.group_by_first == 'f_date')) {
			key[0] = params.thedate;
		}
		let theKey = key.join(',');
		preData.set(theKey, preData.get(preKey))
		set.add(theKey);
	}

	// for (let key of preData.keys()) {
	// 	key = key.split(',');
	// 	if (key.length > 1) {
	// 		key[0] = params.thedate;
	// 	}
	// 	set.add(key.join(','));
	// }
	return set;
}

function formatValue(data) {
	if (!data) {
		return ['--'];
	}
	let ret = [];
	ret[0] = data[0] < 0 ? '--' : parseFloat(data[0]).toFixed(3);
	ret[0] = ret[0].replace(/[\\.]*[0]+$/, '');
	return ret;
}

module.exports = MonitorPropertyService;
