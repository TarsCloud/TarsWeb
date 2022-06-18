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

const CommonService = require('../common/CommonService');

const AdapterService = {};

// AdapterService.adpaterConfFields = () => {
// 	return {
// 		application: '',
// 		serverName: '',
// 		node_name: '',
// 		adapter_name: '',
// 		thread_num: 1,
// 		endpoint: '',
// 		max_connections: 1000,
// 		allow_ip: '',
// 		servant: '',
// 		queuecap: '',
// 		queuetimeout: '',
// 		posttime: "0000:00:00 00:00:00",
// 		lastuser: '',
// 		protocol: "tars",
// 		handlegroup: ''
// 	};
// };


AdapterService.serverAdapterSelect = async (serverData, isTars, isTcp, limiter) => {

	let labelSelector = `${CommonService.TServerAppLabel}=${serverData.application}`;
	if (serverData.serverName) {
		labelSelector += `,${CommonService.TServerNameLabel}=${serverData.serverName}`;
	}

	if (isTars) {
		labelSelector += `,${CommonService.TSubTypeLabel}=${CommonService.TServerType1}`
	}

	let allItems = [];

	let allServerItems = (await CommonService.listObject("tservers", labelSelector)).body.items;

	// console.log(labelSelector, allServerItems);

	allServerItems.forEach(server => {
		if (server.spec.tars) {
			server.spec.tars.servants.forEach(servant => {
				servant.name = CommonService.getServerId(server.spec.app, server.spec.server) + '.' + servant.name;
				allItems.push(servant);
			});
		}
	});

	// filter
	let filterItems = allItems

	if (isTcp) {
		filterItems = [];

		allItems.forEach(elem => {
			// if (elem.name == filter.eq["AdapterId"] && elem.IsTars == filter.eq["IsTars"] && elem.IsTcp == filter.eq["IsTcp"]) {
			if (elem.isTcp) {
				filterItems.push(elem);
			}
		});
	}

	// limiter
	if (limiter != null) {
		let {
			start,
			stop
		} = CommonService.pageList(filterItems.length, limiter);
		filterItems = filterItems.slice(start, stop);
	}

	// Count填充
	let result = {};
	result.Count = {};
	result.Count["AllCount"] = allItems.length;
	result.Count["FilterCount"] = filterItems.length;

	// Data填充
	result.Data = [];
	filterItems.forEach(item => {
		let elem = {};

		let fields = item.name.split(".");
		if (fields.length != 3) {
			return;
		}
		elem["ServerId"] = CommonService.getServerId(fields[0], fields[1])
		elem["Name"] = fields[2]

		elem["AdapterId"] = item.name
		elem["Threads"] = item.thread
		elem["Connections"] = item.connection
		elem["Port"] = item.port
		elem["Capacity"] = item.capacity
		elem["Timeout"] = item.timeout
		elem["IsTars"] = item.isTars
		elem["IsTcp"] = item.isTcp

		result.Data.push(elem);
	})

	return {
		ret: 200,
		msg: 'succ',
		data: result
	};
}

// CommonService.equalServerAdapter = (oldAdapter, newAdapter) => {
// 	if(oldAdapter.Name != newAdapter.Name){
//         return false;
// 	}
// 	if(oldAdapter.Thread != newAdapter.Threads) {
//         return false;
// 	}
// 	if(oldAdapter.Connection != newAdapter.Connections) {
//         return false;
// 	}
// 	if(oldAdapter.Port != newAdapter.Port) {
//         return false;
// 	}
// 	if(oldAdapter.Capacity != newAdapter.Capacity) {
//         return false;
// 	}
// 	if(oldAdapter.Timeout != newAdapter.Timeout) {
//         return false;
// 	}
// 	if(oldAdapter.IsTcp != newAdapter.IsTCP) {
//         return false;
// 	}
// 	if(oldAdapter.IsTars != newAdapter.IsTars) {
// 		return false
// 	}
// 	return true
// }

AdapterService.serverAdapterCreate = async (metadata) => {

	let tServer = await CommonService.getServer(metadata.serverData.application + "-" + metadata.serverData.serverName);

	if (!tServer) {
		return {
			ret: 500,
			msg: "server not exists"
		};
	}

	tServer = tServer.body;

	let tServerCopy = JSON.parse(JSON.stringify(tServer));

	for (let item in metadata.Servant) {

		let target = metadata.Servant[item];

		let adapter = {};
		adapter.name = target.Name
		adapter.isTars = target.IsTars
		adapter.isTcp = target.IsTCP
		adapter.timeout = target.Timeout
		adapter.capacity = target.Capacity
		adapter.port = target.Port
		adapter.connection = target.Connections
		adapter.thread = target.Threads

		tServerCopy.spec.tars.servants.push(adapter);
	}

	let data = await CommonService.replaceObject("tservers", tServerCopy.metadata.name, tServerCopy);

	return {
		ret: 200,
		msg: 'succ',
		data: data.body
	};
}

AdapterService.serverAdapterUpdate = async (metadata, target) => {

	let fields = metadata.AdapterId.split(".");
	if (fields.length != 3) {
		return {
			ret: 500,
			msg: "invalid adapterId"
		};
	}

	let ServerId = CommonService.getServerId(fields[0], fields[1]);
	let AdapterName = fields[2];

	let tServer = await CommonService.getObject("tservers", CommonService.getTServerName(ServerId));
	if (!tServer) {
		return {
			ret: 500,
			msg: "server not exists"
		};
	}

	tServer = tServer.body;

	let index = -1

	for (let i = 0; i < tServer.spec.tars.servants.length; i++) {

		if (tServer.spec.tars.servants[i].name == AdapterName) {
			index = i;
		}
	}
	if (index == -1) {
		return {
			ret: 500,
			msg: "adatper not exists"
		};
	}

	let tServerCopy = JSON.parse(JSON.stringify(tServer));
	tServerCopy.spec.tars.servants[index].name = target.Name
	tServerCopy.spec.tars.servants[index].isTars = target.IsTars
	tServerCopy.spec.tars.servants[index].isTcp = target.IsTcp
	tServerCopy.spec.tars.servants[index].timeout = target.Timeout
	tServerCopy.spec.tars.servants[index].capacity = target.Capacity
	tServerCopy.spec.tars.servants[index].port = target.Port
	tServerCopy.spec.tars.servants[index].connection = target.Connections
	tServerCopy.spec.tars.servants[index].thread = target.Threads

	let data = await CommonService.replaceObject("tservers", tServerCopy.metadata.name, tServerCopy);

	return {
		ret: 200,
		msg: 'succ',
		data: data.body
	};
}

AdapterService.serverAdapterDelete = async (metadata) => {
	let fields = metadata.AdapterId.split(".");
	if (fields.length != 3) {
		return {
			ret: 500,
			msg: "invalid adapterId"
		};
	}

	let ServerId = CommonService.getServerId(fields[0], fields[1]);
	let AdapterName = fields[2]

	let tServer = await CommonService.getObject("tservers", CommonService.getTServerName(ServerId));
	if (!tServer) {
		return {
			ret: 500,
			msg: "server not exists"
		};
	}

	tServer = tServer.body;

	let index = -1;

	for (let i = 0; i < tServer.spec.tars.servants.length; i++) {
		if (tServer.spec.tars.servants[i].name == AdapterName) {
			index = i;
		}
	}

	if (index == -1) {
		return {
			ret: 500,
			msg: "adatper not exists"
		};
	}

	let tServerCopy = JSON.parse(JSON.stringify(tServer));

	tServerCopy.spec.tars.servants.splice(index, 1);

	let data = await CommonService.replaceObject("tservers", tServerCopy.metadata.name, tServerCopy);

	return {
		ret: 200,
		msg: 'succ',
		data: data.body
	};
}

AdapterService.getAllAdapterConfList = async (metadata) => {

	let ServerId = CommonService.getServerId(metadata.ServerApp, metadata.ServerName);

	let tServer = await CommonService.getObject("tservers", CommonService.getTServerName(ServerId));
	if (!tServer) {
		return {
			ret: 500,
			msg: "server not exists"
		};
	}

	tServer = tServer.body;

	// console.log(tServer);

	let data = [];

	if (tServer.spec.tars && tServer.spec.tars.servants) {
		for (let i = 0; i < tServer.spec.tars.servants.length; i++) {
			data.push({
				servant: metadata.ServerApp + "." + metadata.ServerName + "." + tServer.spec.tars.servants[i].name
			});
		}
	}

	return {
		ret: 200,
		msg: 'succ',
		data: data
	};
}


module.exports = AdapterService;