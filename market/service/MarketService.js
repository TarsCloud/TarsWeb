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

const ServerService = require('../../app/service/server/ServerService');
const CommonService = require('../../k8s/service/common/CommonService');

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
					return value[CommonService.TServerCloudProductID] == data[CommonService.TServerCloudProduct][CommonService.TServerCloudProductID];
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

module.exports = MarketService;