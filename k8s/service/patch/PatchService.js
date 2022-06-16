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

const moment = require('moment');

const CommonService = require("../common/CommonService");
const ImageService = require("../image/ImageService");
const PatchService = {};

PatchService.buildSelect = async (serverData) => {

	// let v = ServerId.split(".");

	let labelSelector = `${CommonService.TImageTypeLabel}=server,${CommonService.TServerAppLabel}=${serverData.application}`;
	if (serverData.serverName) {
		labelSelector += `,${CommonService.TServerNameLabel}=${serverData.serverName}`;
	}

	let tImages = await CommonService.listObject("timages", labelSelector);

	let allItems = tImages.body;

	let result = {};

	// Data填充
	result.Data = [];

	if (allItems) {

		allItems = allItems.items;

		allItems.forEach(item => {

			let data = null;
			if (item.build && item.build.running) {
				data = item.build.running;
			} else if (item.build && item.build.last) {
				data = item.build.last;
			}

			if (data) {

				let elem = {};

				elem["ImageName"] = item.metadata.name
				elem["BaseImage"] = data.baseImage
				elem["Id"] = data.id
				elem["Message"] = data.message
				elem["Phase"] = data.phase
				elem["ServerType"] = data.serverType
				elem["CreatePerson"] = data.createPerson
				elem["CreateTime"] = data.createTime
				elem["Mark"] = data.mark
				elem["Image"] = data.image

				result.Data.push(elem);
			}

		})
	}

	return {
		ret: 200,
		msg: 'succ',
		data: result
	};
}

PatchService.deleteBuild = async (ImageName) => {

	let tImage = await CommonService.getObject("timages", ImageName);

	if (tImage) {
		tImage = tImage.body;

		if (tImage.build) {
			delete tImage.build.running;
			delete tImage.build.last;

			await CommonService.replaceObject("timages", ImageName, tImage);
		}
	}

	return {
		ret: 200,
		msg: 'succ',
		data: tImage
	};
}

PatchService.servicePoolSelect = async (serverData) => {

	// let v = ServerId.split(".");

	let labelSelector = `${CommonService.TImageTypeLabel}=server,${CommonService.TServerAppLabel}=${serverData.application}`;
	if (serverData.serverName) {
		labelSelector += `,${CommonService.TServerNameLabel}=${serverData.serverName}`;
	}

	// console.log(labelSelector);

	let tImages = await CommonService.listObject("timages", labelSelector);

	let allItems = tImages.body;

	// console.log(allItems);

	let result = {};

	// Data填充
	result.Data = [];

	if (allItems) {

		allItems = allItems.items;

		allItems.forEach(item => {

			item.releases = item.releases || [];

			item.releases.forEach(release => {

				let elem = {};

				elem["ServerApp"] = serverData.application

				elem["ServerName"] = serverData.serverName

				elem["Name"] = item.metadata.name

				elem["Id"] = release.id;
				elem["CreatePerson"] = release.createPerson;
				elem["CreateTime"] = release.createTime;
				elem["Secret"] = release.secret;
				elem["Mark"] = release.mark;
				elem["Image"] = release.image;

				result.Data.push(elem);
			})

		})
	}

	return {
		ret: 200,
		msg: 'succ',
		data: result
	};
}

PatchService.servicePoolCreate = async (metadata) => {

	let tServer = await CommonService.getObject("tservers", CommonService.getTServerName(metadata.ServerId));

	if (!tServer) {
		return {
			ret: 500,
			msg: "server not exists"
		};
	}

	tServer = tServer.body;

	await ImageService.serverImageGetAndCreate(metadata.ServerId);

	return {
		ret: 200,
		msg: 'succ',
		data: data.body,
		release: tNewRelease
	};
}

PatchService.servicePoolUpdate = async (metadata) => {

	let tServer = await CommonService.getServer(metadata.serverData.application + "-" + metadata.serverData.serverName);

	if (!tServer) {
		return {
			ret: 500,
			msg: "server not exists"
		};
	}

	tServer = tServer.body;

	if (tServer.spec.subType != CommonService.TServerType1) {
		return {
			ret: 500,
			msg: "server type not support"
		};
	}

	let tImage = await CommonService.getObject("timages", tServer.metadata.name);

	if (!tImage) {
		return {
			ret: 500,
			msg: "timages not exists"
		};
	}

	tImage = tImage.body;

	let index = -1;

	for (let i = 0; i < tImage.releases.length; i++) {
		if (tImage.releases[i].id == metadata.Id) {
			index = i
			break
		}
	}
	if (index == -1) {
		return {
			ret: 500,
			msg: "can not find the release image"
		};
	}

	let readyActiveRelease = tImage.releases[index]

	let tServerCopy = JSON.parse(JSON.stringify(tServer));

	if (tServerCopy.spec.release == null) {
		tServerCopy.spec.release = {}
	}

	tServerCopy.spec.k8s.replicas = metadata.Replicas || tServerCopy.spec.k8s.replicas || 1
	tServerCopy.spec.release.id = readyActiveRelease.id
	tServerCopy.spec.release.image = readyActiveRelease.image
	tServerCopy.spec.release.secret = readyActiveRelease.secret
	tServerCopy.spec.release.nodeImage = metadata.NodeImage
	await CommonService.replaceObject("tservers", tServerCopy.metadata.name, tServerCopy);

	return {
		ret: 200,
		msg: 'succ'
	};
}


PatchService.ServiceNowImages = async (serverData) => {

	let tServer = await CommonService.getObject("tservers", CommonService.getTServerName(serverData.application + '-' + serverData.serverName));
	if (!tServer) {
		return {
			ret: 500,
			msg: "server not exists"
		};
	}

	tServer = tServer.body;

	let elem = {};
	if (tServer.spec.release) {
		elem["ServerId"] = CommonService.getServerId(tServer.spec.app, tServer.spec.server)
		elem["Id"] = tServer.spec.release.id;
		elem["Image"] = tServer.spec.release.image
		elem["NodeImage"] = tServer.spec.release.nodeImage
	}

	return {
		ret: 200,
		msg: 'succ',
		data: elem
	};
}

PatchService.serviceEnabledSelect = async (serverData) => {

	let tServer = await CommonService.getObject("tservers", CommonService.getTServerName(serverData.application + '-' + serverData.serverName));
	if (!tServer) {
		return {
			ret: 500,
			msg: "server not exists"
		};
	}

	tServer = tServer.body;

	let elem = {};
	if (tServer.spec.release) {

		elem["ServerId"] = CommonService.getServerId(tServer.spec.app, tServer.spec.server)
		elem["Id"] = tServer.spec.release.id;
		elem["Image"] = tServer.spec.release.image
	}

	return {
		ret: 200,
		msg: 'succ',
		data: elem
	};
}

module.exports = PatchService;