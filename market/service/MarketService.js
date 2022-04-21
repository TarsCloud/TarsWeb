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

const TaskService = require('../../app/service/task/TaskService');
const ServerService = require('../../app/service/server/ServerService');
const CommonService = require('../../k8s/service/common/CommonService');
const AuthService = require('../../app/service/auth/AuthService');
const util = require('../../tools/util');
const {
	application
} = require('express');
const MarketService = {};

MarketService.listInstall = async (product) => {

	let data = await ServerService.getServerConfBySource();

	let items = [];

	data.forEach(d => {
		let data = JSON.parse(d.source);

		// console.log(data);

		if (product) {
			if (data[CommonService.TServerCloudProduct]) {
				let service = JSON.parse(JSON.stringify(data));
				delete service[CommonService.TServerCloudProduct];

				let pos = items.findIndex((value) => {
					return value[CommonService.TServerCloudID] == data[CommonService.TServerCloudProduct][CommonService.TServerCloudID];
				});

				if (pos == -1) {
					let v = data[CommonService.TServerCloudProduct];
					v["servers"] = [];
					v["servers"].push(service);

					items.push(v);
				} else {
					items[pos]["servers"].push(service);
				}
			}
		} else {
			if (!data[CommonService.TServerCloudProduct]) {
				items.push(data);
			}
		}
	});

	// console.log(items);

	return {
		ret: 200,
		msg: 'succ',
		data: items
	};
}

MarketService.get = async (appliation, server_name) => {

	let items = await ServerService.getServerConfList(appliation, server_name);

	return {
		ret: 200,
		msg: 'succ',
		data: items
	};

};

MarketService.uninstallServer = async (application, server_name, uid) => {

	let servers = [];
	servers.push({
		application: application,
		server_name: server_name
	});

	return await MarketService.uninstallProduct(servers, uid);
};

MarketService.uninstallProduct = async (servers, uid) => {
	let ids = [];
	let items = [];
	let task_no = util.getUUID().toString();

	for (let i = 0; i < servers.length; i++) {

		let node_servers = await ServerService.getServerConfList(servers[i].application, servers[i].server_name);

		console.log(node_servers);

		for (let j = 0; j < node_servers.length; j++) {

			let node_server = await ServerService.getServerConfById(node_servers[j].id);

			if (!await AuthService.hasDevAuth(node_server.application, node_server.server_name, uid)) {
				return {
					ret: 500,
					msg: '#common.noPrivilage#',
				};
			}

			items.push({
				server_id: node_server.id,
				command: "undeploy_tars"
			});

			ids.push(node_server.id);
		}
	}

	// console.log(items);

	if (ids.length > 0) {
		await TaskService.addTask({
			serial: true,
			elegant: false,
			eachnum: 1,
			items,
			task_no,
			user_name: uid
		});

		let timeout = false;
		let start = (new Date()).getTime();

		while (true) {
			await util.sleep(500);

			let data = await ServerService.getServerConfByIds(ids);

			// console.log(data);

			if (data.length == 0) {
				break;
			}

			if (((new Date()).getTime() - start) > 3000) {
				timeout = true;
				break;
			}
		}

		if (timeout) {
			return {
				ret: 500,
				msg: '#deployService.form.uninstallTimeout#',
				data: task_no
			};
		}
	}

	return {
		ret: 200,
		msg: 'succ',
		data: task_no
	};
};

module.exports = MarketService;