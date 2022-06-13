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
const ServerService = require('../../k8s/service/server/ServerService');
const CommonService = require('../../k8s/service/common/CommonService');
const AuthService = require('../../k8s/service/auth/AuthService');
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
						return value[CommonService.TServerCloudID] == annotations[CommonService.TServerCloudProduct][CommonService.TServerCloudID];
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

					v = Object.assign(v, annotations);
					items.push(v);
				}
			}
		}

	});

	// console.log(product, items);

	return {
		ret: 200,
		msg: 'succ',
		data: items
	};
}

MarketService.get = async (app, server) => {

	let data = await CommonService.getObject("tservers", CommonService.getTServerName(app + "-" + server));

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

MarketService.uninstallServer = async (application, server_name, uid) => {

	if (!await AuthService.hasDevAuth(application, server_name, uid)) {
		return {
			ret: 500,
			msg: '#common.noPrivilage#',
		};
	}

	const metadata = {
		ServerId: [application + '-' + server_name]
	}

	return await ServerService.deleteServer(metadata);
};

MarketService.uninstallProduct = async (servers, uid) => {

	let ServerId = [];

	for (let i = 0; i < servers.length; i++) {
		let server = servers[i];
		if (!await AuthService.hasDevAuth(server.application, server.server_name, uid)) {
			return {
				ret: 500,
				msg: '#common.noPrivilage#',
			};
		}
		ServerId.push(server.application + '-' + server.server_name);
	}

	const metadata = {
		ServerId: ServerId
	};

	return await ServerService.deleteServer(metadata);
};

MarketService.getFrameworkKey = async () => {

	let fkey = await CommonService.getObject("tframeworkkey", "key");

	// console.log(fkey);

	if (fkey) {
		return fkey.body.spec;
	} else {

		return null;
	}

};

MarketService.updateFrameworkKey = async (cuid, priKey) => {

	let fkey = await CommonService.getObject("tframeworkkey", "key");

	if (!fkey) {
		//创建用户
		fkey = {
			apiVersion: CommonService.GROUP + '/' + CommonService.VERSION,
			kind: 'TFrameworkKey',
			metadata: {
				namespace: CommonService.NAMESPACE,
				name: "key",
			},
			spec: {
				cuid: cuid,
				pri_key: priKey,
				autologin: 1
			},
		}

		await CommonService.createObject("tframeworkkey", fkey);
	} else {
		fkey = fkey.body;

		if (fkey.spec.pri_key != priKey) {
			return;
		}

		fkey.spec.cuid = cuid;
		fkey.spec.pri_key = priKey;

		await CommonService.replaceObject("tframeworkkey", "key", fkey);
	}
};

MarketService.updateFrameworkAutoLogin = async (autologin) => {
	let fkey = await CommonService.getObject("tframeworkkey", "key");

	if (fkey) {

		fkey = fkey.body;

		fkey.spec.autologin = autologin;

		await CommonService.replaceObject("tframeworkkey", "key", fkey);
	}
};

module.exports = MarketService;