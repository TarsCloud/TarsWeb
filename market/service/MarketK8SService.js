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
// const DeployService = require('../../k8s/service/deploy/DeployService');
const CommonService = require('../../k8s/service/common/CommonService');

const MarketService = {};


MarketService.listInstall = async (product) => {

	let labelSelector = `${CommonService.TServerCloudInstall}`;

	let data = await CommonService.listObject("tservers", labelSelector);

	let items = [];

	data.body.items.forEach(item => {
		// var v = 

		if (item.metadata.annotations[CommonService.TServerCloudInstall]) {
			let annotations = JSON.parse(item.metadata.annotations[CommonService.TServerCloudInstall]);

			// console.log(annotations);
			let v = {};

			if (product) {
				if (item.metadata.labels[CommonService.TServerCloudInstall] == "product") {

					let service = JSON.parse(JSON.stringify(annotations));
					delete service[CommonService.TServerCloudProduct];

					let pos = items.findIndex((value) => {
						return value[CommonService.TServerCloudProductID] == annotations[CommonService.TServerCloudProduct][CommonService.TServerCloudProductID];
					});

					if (pos == -1) {
						v = Object.assign(v, annotations[CommonService.TServerCloudProduct]);
						v["servers"] = [];
						v["servers"].push(service);

						items.push(v);
					} else {
						items[pos]["servers"].push(service);
					}


				}
			} else {

				if (item.metadata.labels[CommonService.TServerCloudInstall] == "service") {

					let service = JSON.parse(JSON.stringify(annotations));

					console.log(service);

					v = Object.assign(v, annotations);
					items.push(v);
				}
			}
		}

	});

	console.log(product, items);

	return {
		ret: 200,
		msg: 'succ',
		data: items
	};
}

MarketService.get = async (app, name) => {

	let data = await CommonService.getObject("tservers", CommonService.getTServerName(app + "-" + name));

	delete data.body.metadata.managedFields;

	data.body.spec.k8s.mounts = data.body.spec.k8s.mounts.filter(mount => {
		return mount.name != "host-log-dir";
	});

	return {
		ret: 200,
		msg: 'succ',
		data: data.body
	};
};

// MarketService.upgrade = async (paramsObj) => {

// 	return await DeployService.upgrade(paramsObj.deploy, paramsObj.cloud);
// };

module.exports = MarketService;