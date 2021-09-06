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

const logger = require('../../../logger');
const util = require('../../../tools/util');
// const MonitorStatService = require('../../service/monitor/MonitorStatService');
// const MonitorPropertyService = require('../../../../index/monitor/MonitorPropertyService');
const MonitorPropertyService = require('../../../index/service/monitor/MonitorPropertyService');

const MonitorController = {};

// MonitorController.tarsstat = async (ctx) => {
// 	let {thedate, predate, startshowtime, endshowtime, master_name, slave_name, interface_name, master_ip, slave_ip, group_by,userpc} = ctx.paramsObj;
// 	try {
// 		let list = await MonitorStatService.getData({
// 			thedate,
// 			predate,
// 			startshowtime,
// 			endshowtime,
// 			master_name,
// 			slave_name,
// 			interface_name,
// 			master_ip,
// 			slave_ip,
// 			group_by,
// 			userpc
// 		});
// 		list.sort((a, b)=>{
// 			return a.show_time > b.show_time ? 1 : -1
// 		});
// 		ctx.makeResObj(200, '', util.viewFilter(list, {
// 			show_date: '',
// 			show_time: '',
// 			master_name: '',
// 			slave_name: '',
// 			interface_name: '',
// 			master_ip: '',
// 			slave_ip: '',
// 			the_total_count: '',
// 			pre_total_count: '',
// 			total_count_wave: '',
// 			the_avg_time: '',
// 			pre_avg_time: '',
// 			the_fail_rate: '',
// 			pre_fail_rate: '',
// 			the_timeout_rate: '',
// 			pre_timeout_rate: '',
// 		}));
// 	} catch (e) {
// 		logger.error(e, ctx);
// 		ctx.makeResObj(500, e && e.message || e);
// 	}
// };

// MonitorController.tarsproperty = async (ctx) => {
// 	let {thedate, predate, startshowtime, endshowtime, master_name, master_ip, property_name, policy, group_by,userpc} = ctx.paramsObj;
// 	try {
// 		let list = await MonitorPropertyService.getData({
// 			thedate,
// 			predate,
// 			startshowtime,
// 			endshowtime,
// 			master_name,
// 			master_ip,
// 			property_name,
// 			policy,
// 			group_by,
// 			userpc
// 		});
// 		list.sort((a, b)=>{
// 			return a.show_time > b.show_time ? 1 : -1
// 		});
// 		ctx.makeResObj(200, '', util.viewFilter(list, {
// 			show_date: '',
// 			show_time: '',
// 			master_name: '',
// 			master_ip: '',
// 			property_name: '',
// 			policy: '',
// 			the_value: '',
// 			pre_value: ''
// 		}));
// 	} catch (e) {
// 		logger.error(e, ctx);
// 		ctx.makeResObj(500, e && e.message || e);
// 	}
// };

//tarsnode 按要求需要获取按上报属性名所有的上报图形
MonitorController.tarsnodeProperty = async (ctx) => {
	let {thedate, predate, startshowtime, endshowtime, master_name, master_ip, property_name, policy, group_by, userpc} = ctx.paramsObj;
	try {
		let propertyDict = {
			cpuUsed: '#machineInfo.char.cpuUsed#',
			loadAvg1: '#machineInfo.char.loadAvg1#',
			memUsed: '#machineInfo.char.memUsed#',
			memAvailable: '#machineInfo.char.memAvailable#',
			nodeDiskUsed: '#machineInfo.char.nodeDiskUsed#',
			nodeDiskAvailable: '#machineInfo.char.nodeDiskAvailable#',
			rootDiskUsed: '#machineInfo.char.rootDiskUsed#',
			rootDiskAvailable: '#machineInfo.char.rootDiskAvailable#',
		}
		let properties = ["cpuUsed","loadAvg1","memUsed","memAvailable","nodeDiskUsed","nodeDiskAvailable","rootDiskUsed","rootDiskAvailable"];
		//1.获取当前所有的 property_name特性值
		let list = await MonitorPropertyService.getData({
			thedate,
			predate,
			startshowtime,
			endshowtime,
			master_name,
			master_ip,
			property_name,
			policy,
			group_by: "property_name",
			userpc
		});
		let propertiesAll = list.map(item=>{return item.property_name});
		let chars = []
		for (let key in properties) {
			if(propertiesAll.includes(properties[key])){
				propertiesAll.includes(properties[key])
				chars.push(properties[key])
			}
		}
		let gt = Array.from(new Set([...new Set(propertiesAll)].filter(x => !new Set(properties).has(x))));
		gt.forEach(item=>{chars.push(item)});
		let charOptions = [];
		for (let item in chars) {
			let option = await MonitorPropertyService.getData({
				thedate, predate, startshowtime, endshowtime, master_name, master_ip,
				property_name: chars[item],policy
			});
			option.sort((a, b)=>{
				return a.show_time > b.show_time ? 1 : -1
			});
			charOptions.push({
				title: propertyDict[chars[item]] || chars[item],
				timeColumn: 'show_time',
				dataColumns: [
					{name: 'the_value', label: '#monitor.property.property#'},
					{name: 'pre_value', label: '#monitor.property.propertyC#'},
				],
				data: util.viewFilter(option, {
					show_date: '',
					show_time: '',
					master_name: '',
					master_ip: '',
					property_name: '',
					policy: '',
					the_value: '',
					pre_value: ''
				}),
			})
		}
		ctx.makeResObj(200, '',charOptions);
	} catch (e) {
		logger.error(e, ctx);
		ctx.makeResObj(500, e && e.message || e);
	}
};

module.exports = MonitorController;
