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
const stream = require('stream');
const axios = require('axios');
const k8s = require('@kubernetes/client-node');
const logger = require('../../../logger');
const WebConf = require('../../../config/webConf');
const request = require('request-promise');

let md5 = require('md5');
const CommonService = {};

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const log = new k8s.Log(kc);

const exec = new k8s.Exec(kc);

const opts = {};
kc.applyToRequest(opts);


// console.log(k8sApi.basePath);

const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
const k8sApi = kc.makeApiClient(k8s.CustomObjectsApi);

CommonService.getApi = () => {
	return k8sCoreApi;
}
CommonService.getK8sApi = () => {
	return k8sApi;
}

CommonService.getPath = (path) => {
	return `/${WebConf.k8s.apiPrefix}/namespaces/${path}`;
}

// https: //104.197.5.247/api/v1/namespaces/kube-system/services/https:elasticsearch-logging/proxy/_cluster/health?pretty=true
// CommonService.getServiceHttpPath = (schema, port, service, path) => {

// 	return `${kc.getCurrentCluster().server}/api/v1/namespaces/${CommonService.NAMESPACE}/services/${schema}:${service}:${port}/proxy/${path}`;
// }

// console.log(opts);
CommonService.request = async (schema, service, path, body, method) => {

	method = method || "POST";

	let data = {};

	let url = '';

	if (!process.env.KUBERNETES_SERVICE_HOST) {
		Object.assign(data, opts);

		url = `${kc.getCurrentCluster().server}/api/v1/namespaces/${CommonService.NAMESPACE}/services/${schema}:${service}/proxy/${path}`;
	} else {
		url = `${schema}://${service}/${path}`
	}

	data.headers = {
		"Content-Type": "application/json"
	};

	data.json = body;

	if (method == "put") {
		return await request.put(url, data)
	}

	return await request.post(url, data);
}

CommonService.upload = async (name, formData, wait) => {
	let data = {};
	let url = '';

	if (!process.env.KUBERNETES_SERVICE_HOST) {
		Object.assign(data, opts);
		url = `${kc.getCurrentCluster().server}/api/v1/namespaces/${CommonService.NAMESPACE}/services/http:tars-tarsimage:80/proxy/${WebConf.k8s.upload}/${name}/building?wait=${wait}`;
	} else {
		url = `http://tars-tarsimage/${WebConf.k8s.upload}/${name}/building?wait=${wait}`;
	}

	data.formData = formData;
	data.timeout = 500 * 1000;

	logger.info(`upload to image request:${url}`);

	return await request.post(url, data);
}

CommonService.NAMESPACE = process.env.Namespace || WebConf.k8s.namespace;

CommonService.NodeFramworkAbilityLabelPrefix = "tars.io/node." + CommonService.NAMESPACE // 此标签表示 该节点可以被框架使用
CommonService.NodeAppAbilityLabelPrefix = "tars.io/ability." + CommonService.NAMESPACE + "." // 此标签表示 该节点可以被某个具体app节点池使用 tars.io/ability.$Namespace.$App
CommonService.SupportLocalVolume = "tars.io/SupportLocalVolume" // 此标签表示 该节点可以被某个具体app节点池使用 tars.io/ability.$Namespace.$App

CommonService.TREENAME = 'tars-tree';
CommonService.TFC = "tars-framework"
CommonService.TARSNODE = "node"
CommonService.GROUP = "k8s.tars.io";
CommonService.VERSION = "v1beta2";
CommonService.APPROVE = "tars.io/Approve";
CommonService.TImageTypeLabel = "tars.io/ImageType"
CommonService.TSupportedLabel = "tars.io/Supported."
CommonService.TSubTypeLabel = "tars.io/SubType"
CommonService.TServerAppLabel = "tars.io/ServerApp"
CommonService.TServerNameLabel = "tars.io/ServerName"
CommonService.TServerCloudInstall = "tars.io/CloudInstall"
CommonService.TServerCloudLogo = "tars.io/CloudLogo"
CommonService.TServerCloudDigest = "tars.io/CloudDigest"
CommonService.TServerCloudProduct = "tars.io/CloudProduct"
CommonService.TServerCloudID = "tars.io/CloudID"
CommonService.TServerCloudTitle = "tars.io/CloudTitle"
CommonService.TServerCloudProductDigest = "tars.io/CloudProductDigest"

CommonService.TServerType1 = "tars";
CommonService.TServerType2 = "normal";
CommonService.TDeployApproveLabel = "tars.io/Approve"
CommonService.TConfigNameLabel = "tars.io/ConfigName"
CommonService.TConfigPodSeqLabel = "tars.io/PodSeq"
CommonService.TConfigActivated = "tars.io/Activated"
CommonService.TConfigVersion = "tars.io/Version"
CommonService.TSecret = "tars.io/Secret";

CommonService.connectPodExec = async (name, command, container) => {

	return await exec.exec(CommonService.NAMESPACE, name, container, command, process.stdout, process.stderr, process.stdin, true, (status) => {
		logger.error('Exited with status:', status);
		// tslint:disable-next-line:no-console
	});
}

CommonService.listNode = async () => {
	return await k8sCoreApi.listNode("true", false);
}

CommonService.readNode = async (name) => {
	return await k8sCoreApi.readNode(name);
}

CommonService.replaceNode = async (name, patch) => {
	return await k8sCoreApi.replaceNode(name, patch);
}

CommonService.patchNode = async (name, patch) => {
	return await k8sCoreApi.patchNode(name, patch, "true", undefined, "JsonPatch", undefined, {
		headers: {
			"Content-Type": "application/json-patch+json"
		}
	});
}

CommonService.listObject = async (plural, labelSelector, limit, Continue) => {

	return await k8sApi.listNamespacedCustomObject(CommonService.GROUP, CommonService.VERSION, CommonService.NAMESPACE, plural, "true", null, Continue, null, labelSelector, limit);
}

CommonService.describePod = async (podName) => {

	return await k8sCoreApi.readNamespacedPod(podName, CommonService.NAMESPACE, true);
}

CommonService.readPodLog = async (containerName, podName, previous, logStream) => {

	return await log.log(CommonService.NAMESPACE, podName, containerName, logStream, {
		follow: true,
		pretty: true,
		previous: previous,
		tailLines: 500,
		timestamps: true

	});
}

const cacheListener = (cache) => {

	cache.on('add', (o) => {
		logger.info('add', o.metadata.name);
	});

	cache.on('delete', (o) => {
		logger.info('delete', o.metadata.name);
	});

	// cache.on('update', (o) => {
	// 	logger.info('update', o.metadata.name);
	// });

	cache.on('error', (o) => {
		logger.error('error', o);
	});
}

const watch = new k8s.Watch(kc);
const serverListFn = () => CommonService.listObject("tservers");
const tServerList = new k8s.ListWatch(CommonService.getPath(`${CommonService.NAMESPACE}/tservers`), watch, serverListFn, true);

const accountListFn = () => CommonService.listObject("taccounts");
const tAccountList = new k8s.ListWatch(CommonService.getPath(`${CommonService.NAMESPACE}/taccounts`), watch, accountListFn, true);

const templateListFn = () => CommonService.listObject("ttemplates");
const tTemplateList = new k8s.ListWatch(CommonService.getPath(`${CommonService.NAMESPACE}/ttemplates`), watch, templateListFn, true);

const tConfigListFn = () => CommonService.listObject("tframeworkconfigs");
const tConfigList = new k8s.ListWatch(CommonService.getPath(`${CommonService.NAMESPACE}/tframeworkconfigs`), watch, tConfigListFn, true);

const nodeListFn = () => CommonService.listNode();
const tNodeList = new k8s.ListWatch("/api/v1/nodes", watch, nodeListFn, true);

cacheListener(tServerList);
cacheListener(tNodeList);
cacheListener(tTemplateList);
cacheListener(tAccountList);
cacheListener(tConfigList);

const getCacheList = async (cacheList, fn) => {

	if (WebConf.k8s.cache) {
		//load from cache
		return cacheList.list();
	} else {
		const data = await fn();

		return data.body.items;
	}
}

CommonService.replaceObject = async (plural, name, object, group, version) => {
	return await k8sApi.replaceNamespacedCustomObject(group || CommonService.GROUP, version || CommonService.VERSION,
		CommonService.NAMESPACE, plural, name, object);
	// , undefined, undefined, {
	// 	headers: {
	// 		"Content-Type": "application/json"
	// 	}
	// });
}

CommonService.createObject = async (plural, object, group, version) => {
	return await k8sApi.createNamespacedCustomObject(group || CommonService.GROUP, version || CommonService.VERSION,
		CommonService.NAMESPACE, plural, object);
}

CommonService.getObject = async (plural, name, group, version) => {
	let data = null;
	try {
		data = await k8sApi.getNamespacedCustomObject(group || CommonService.GROUP, version || CommonService.VERSION,
			CommonService.NAMESPACE, plural, name);
	} catch (e) {
		if (e.statusCode == 404) {
			return null;
		}
		throw e;
	}
	return data
}

CommonService.deleteObject = async (plural, name, group, version) => {
	return await k8sApi.deleteNamespacedCustomObject(group || CommonService.GROUP, version || CommonService.VERSION,
		CommonService.NAMESPACE, plural, name);
}


CommonService.listPods = async (labelSelector) => {
	return await k8sCoreApi.listNamespacedPod(CommonService.NAMESPACE, "true", undefined, undefined, undefined, labelSelector);
}

CommonService.getPod = async (name) => {
	return await k8sCoreApi.readNamespacedPod(name, CommonService.NAMESPACE, "true");
}

CommonService.deletePod = async (name) => {
	return await k8sCoreApi.deleteNamespacedPod(name, CommonService.NAMESPACE, "true")
}


CommonService.getServerList = async (force) => {

	if (force === true) {

		const data = await serverListFn();

		return data.body.items;
	} else {
		return getCacheList(tServerList, serverListFn);
	}
}

CommonService.getTreeData = async () => {
	return (await CommonService.getObject("ttrees", CommonService.TREENAME)).body;
}

CommonService.getNodeList = async () => {
	let nodes = tNodeList.list();
	nodes = nodes.filter(item => {
		return item.metadata.labels.hasOwnProperty(CommonService.NodeFramworkAbilityLabelPrefix);
	});
	return nodes;
}

CommonService.getNodeListAll = async (localPV, hold) => {
	let nodes = tNodeList.list();
	if (localPV) {
		nodes = nodes.filter(item => {
			return item.metadata.labels.hasOwnProperty(CommonService.SupportLocalVolume);

		});
	}

	if (hold) {
		nodes = nodes.filter(item => {
			return item.metadata.labels.hasOwnProperty(CommonService.NodeFramworkAbilityLabelPrefix);

		});
	}
	return nodes;
	// return tNodeList.list();
}

CommonService.getTemplateList = async () => {
	return getCacheList(tTemplateList, templateListFn);
}

CommonService.getFrameworkConfig = async () => {
	let res = await tConfigListFn();
	// console.log(res.body.items);
	// return res.body.items[0];
	// let res = await getCacheList(tConfigList, tConfigListFn)
	let frameConfig = res.body.items.filter(item => item.metadata.name == CommonService.TFC)
	return frameConfig ? frameConfig[0] : {};
}

CommonService.getAccountList = async () => {
	return getCacheList(tAccountList, accountListFn);
}

CommonService.getAccount = async (uid) => {

	if (WebConf.k8s.cache) {
		let o = (await tAccountList.get(md5(uid, 'asString'), CommonService.NAMESPACE));

		if (o) {
			return o;
		}
	}

	const account = (await CommonService.getObject('taccounts', md5(uid, 'asString')));

	if (account) {
		return account.body;
	}

	return null;
}

CommonService.hasAppName = async (appName) => {

	let tree = await CommonService.getTreeData();

	let result = tree.apps.find(item => {
		return item.name == appName;
	});

	return result != undefined;

}

CommonService.addEqFilter = (filter, ServerId) => {

	if (!filter) {
		filter = {}
	}

	if (!filter.eq) {
		filter.eq = {};
	}

	if (ServerId) {
		if (ServerId.indexOf('.') === -1) {
			filter.eq[CommonService.TServerAppLabel] = ServerId;
		} else {
			filter.eq[CommonService.TServerAppLabel] = ServerId.substring(0, ServerId.indexOf('.'))
			filter.eq[CommonService.TServerNameLabel] = ServerId.substring(ServerId.indexOf('.') + 1, ServerId.length)
		}
	}
}

CommonService.createLabelSelector = (filter) => {
	let labelSelector = '';

	if (filter.eq) {
		for (let i in filter.eq) {
			if (labelSelector != '') {
				labelSelector += ',';

			}
			labelSelector += `${i}=${filter.eq[i]}`
		}
	}

	if (filter.noteq) {
		for (let i in filter.noteq) {
			if (labelSelector != '') {
				labelSelector += ',';
			}
			labelSelector += `${i}!=${filter.noteq[i]}`
		}
	}


	return labelSelector;
}


CommonService.getServerId = (serverApp, serverName) => {
	return serverApp + "." + serverName;
}

CommonService.getTServerName = (serverId) => {
	return serverId.replace('.', '-').toLowerCase();
}

CommonService.getMetadataName = (name) => {
	return name.replace('.', '-').toLowerCase();
}

CommonService.randomString = (len) => {
	const chars = 'abcdefghijklmnopqrstuvwxyz';
	var maxPos = chars.length;
	var pwd = '';
	for (i = 0; i < len; i++) {
		pwd += chars.charAt(Math.floor(Math.random() * maxPos));
	}
	return pwd;
}

CommonService.pageList = (itemsLen, limiter) => {
	let start = limiter.offset
	if (start < 0) {
		start = 0;
	} else if (start >= itemsLen) {
		start = itemsLen;
	}

	let stop = limiter.offset + limiter.rows
	if (stop < 0 || stop >= itemsLen) {
		stop = itemsLen
	}

	return {
		start: start,
		stop: stop
	}
}

CommonService.getServer = async (serverId) => {
	let data = null;
	try {
		data = CommonService.getObject("tservers", CommonService.getTServerName(serverId));
	} catch (e) {
		// console.log(e);
		return null;
	}
	return data;
}

CommonService.getDaemonPodByField = async (func) => {
	let labelSelector = `${CommonService.TServerAppLabel}=${CommonService.TServerType1},${CommonService.TServerNameLabel}=${CommonService.TServerType1}agent`;

	let agents = await CommonService.listPods(labelSelector);

	if (!agents) {
		return null;
	}

	agents = agents.body;


	let index = -1;
	for (let i = 0; i < agents.items.length; i++) {

		let agent = agents.items[i];

		if (func(agent) && agent.status.phase == "Running") {
			index = i
			break
		}
	}

	if (index == -1) {
		return null;
	} else {
		return agents.items[index];
	}
}

CommonService.getDaemonPodByName = async (nodeName) => {

	return await CommonService.getDaemonPodByField((pod) => {
		return pod.spec.nodeName == nodeName
	});
}


CommonService.getDaemonPodByHostIp = async (hostIp) => {

	return await CommonService.getDaemonPodByField((pod) => {
		return pod.status.hostIP == hostIp
	});
}

CommonService.buildTServer = (serverApp, serverName, serverServant, serverK8S, serverOption) => {

	let serverId = serverApp + "." + serverName;

	let Servants = [];
	if (serverServant != null) {
		for (let key in serverServant) {
			let obj = serverServant[key];

			Servants.push({
				name: obj.Name,
				port: parseInt(obj.Port),
				thread: parseInt(obj.Threads),
				connection: parseInt(obj.Connections),
				capacity: parseInt(obj.Capacity),
				isTars: obj.IsTars,
				isTcp: obj.IsTcp,
				timeout: parseInt(obj.Timeout),
			});
		}
	}

	let Env = [{
			name: "Namespace",
			valueFrom: {
				fieldRef: {
					fieldPath: "metadata.namespace",
				},
			},
		},
		{
			name: "PodName",
			valueFrom: {
				fieldRef: {
					fieldPath: "metadata.name",
				},
			},
		},
		{
			name: "PodIP",
			valueFrom: {
				fieldRef: {
					fieldPath: "status.podIP",
				},
			},
		},
		{
			name: "ServerApp",
			valueFrom: {
				fieldRef: {
					apiVersion: "v1",
					fieldPath: `metadata.labels['${CommonService.TServerAppLabel}']`,
				},
			},
		}
	]

	let HostPorts = [];
	if (serverK8S.HostPort != null) {
		serverK8S.HostPort.forEach(item => {
			HostPorts.push({
				nameRef: item.NameRef,
				port: item.Port,
			})

		})

	}

	let Mounts = [{
		name: "host-log-dir",
		mountPath: `/usr/local/app/${CommonService.TServerType1}/app_log`,
		subPathExpr: "$(Namespace)/$(PodName)",
		source: {
			hostPath: {
				path: `/usr/local/app/${CommonService.TServerType1}/app_log`,
				type: "DirectoryOrCreate",
			},
		},
	}]

	if (serverK8S.Mounts && serverK8S.Mounts.length != 0) {
		serverK8S.Mounts.forEach(m => {
			Mounts.push(m);
		});
	}

	let NodeSelector = [];
	if (serverK8S.NodeSelector && serverK8S.NodeSelector.length != 0) {
		NodeSelector = serverK8S.NodeSelector;
	}

	let tServer = {
		apiVersion: CommonService.GROUP + '/' + CommonService.VERSION,
		kind: 'TServer',
		metadata: {
			namespace: CommonService.NAMESPACE,
			name: CommonService.getTServerName(serverId),
		},
		spec: {
			app: serverApp,
			server: serverName,
			subType: serverOption.ServerSubType,
			important: serverOption.ServerImportant,
			tars: {
				template: serverOption.ServerTemplate,
				profile: serverOption.ServerProfile,
				asyncThread: serverOption.AsyncThread,
				servants: Servants,
			},
			k8s: {
				env: Env,
				hostIPC: serverK8S.HostIpc,
				hostNetwork: serverK8S.HostNetwork,
				hostPorts: HostPorts,
				mounts: Mounts,
				nodeSelector: NodeSelector,
				notStacked: serverK8S.NotStacked,
				foreground: serverK8S.launcherType || "background",
				replicas: serverK8S.Replicas,
				daemonSet: serverK8S.DaemonSet || false,
				imagePullPolicy: serverK8S.imagePullPolicy || "Always",
				abilityAffinity: serverK8S.AbilityAffinity,
			},
		},
	}

	// console.log(tServer);

	return tServer
}

CommonService.updateTServer = (tServer, serverServant, serverK8S, serverOption) => {

	// let serverId = serverApp + "." + serverName;

	let Servants = [];
	if (serverServant != null) {
		for (let key in serverServant) {
			let obj = serverServant[key];

			Servants.push({
				name: obj.Name,
				port: parseInt(obj.Port),
				thread: parseInt(obj.Threads),
				connection: parseInt(obj.Connections),
				capacity: parseInt(obj.Capacity),
				isTars: obj.IsTars,
				isTcp: obj.IsTcp,
				timeout: parseInt(obj.Timeout),
			});
		}
	}

	let HostPorts = [];
	if (serverK8S.HostPort != null) {
		serverK8S.HostPort.forEach(item => {
			HostPorts.push({
				nameRef: item.NameRef,
				port: item.Port,
			})
		})
	}

	let Mounts = [{
		name: "host-log-dir",
		mountPath: `/usr/local/app/${CommonService.TServerType1}/app_log`,
		subPathExpr: "$(Namespace)/$(PodName)",
		source: {
			hostPath: {
				path: `/usr/local/app/${CommonService.TServerType1}/app_log`,
				type: "DirectoryOrCreate",
			},
		},
	}]

	if (serverK8S.Mounts && serverK8S.Mounts.length != 0) {
		serverK8S.Mounts.forEach(m => {
			Mounts.push(m);
		});
	}

	let NodeSelector = [];
	if (serverK8S.NodeSelector && serverK8S.NodeSelector.length != 0) {
		NodeSelector = serverK8S.NodeSelector;
	}

	// console.log(tServer.spec);
	// Object.assign(tServer.spec, {
	tServer.spec.subType = serverOption.ServerSubType;
	tServer.spec.important = serverOption.ServerImportant;
	tServer.spec.tars.template = serverOption.ServerTemplate || 5;
	tServer.spec.tars.profile = serverOption.ServerProfile;
	// tServer.spec.tars.foreground = false;
	tServer.spec.tars.asyncThread = serverOption.AsyncThread || 3;
	tServer.spec.tars.servants = Servants;

	tServer.spec.k8s.hostPorts = HostPorts;
	tServer.spec.k8s.mounts = Mounts;
	tServer.spec.k8s.hostIPC = serverK8S.HostIpc;
	tServer.spec.k8s.hostNetwork = serverK8S.HostNetwork;
	tServer.spec.k8s.nodeSelector = NodeSelector;
	tServer.spec.k8s.notStacked = serverK8S.NotStacked;
	tServer.spec.k8s.replicas = serverK8S.Replicas;
	tServer.spec.k8s.abilityAffinity = serverK8S.AbilityAffinity;

	// });

	//console.log(JSON.parse(JSON.stringify(tServer.spec)));

	// console.log(tServer);

	return tServer
}


CommonService.buildTDeploy = (metadata) => {

	//部署时 Replicas的值只能为0 ,因为此时没有镜像服务镜像
	metadata.ServerK8S.Replicas = 0
	if (metadata.ServerK8S.HostNetwork) {
		metadata.ServerK8S.HostPort = []; //make([]*models.HostPortElem, 0, 1)
	}

	// 通过管理平台的部署都是TARS服务
	metadata.ServerOption.ServerSubType = CommonService.TServerType1;

	let deployName = CommonService.getTServerName(CommonService.getServerId(metadata.ServerApp, metadata.ServerName)) + '-' + CommonService.randomString(10) + '-' + CommonService.randomString(5);
	let tServer = CommonService.buildTServer(metadata.ServerApp, metadata.ServerName, metadata.ServerServant, metadata.ServerK8S, metadata.ServerOption)

	tServer.spec.mark = metadata.ServerMark;
	tServer.spec.person = metadata.Uid;

	let tDeploy = {
		apiVersion: CommonService.GROUP + '/' + CommonService.VERSION,
		kind: 'TDeploy',
		metadata: {
			namespace: CommonService.NAMESPACE,
			name: deployName,
		},
		apply: tServer.spec,
	}

	return tDeploy;
}

CommonService.ConvertOperatorK8SToAdminK8S = (operatorK8S) => {

	let hostPort = [];
	if (operatorK8S.hostPorts != null) {

		operatorK8S.hostPorts.forEach(port => {
			hostPort.push({
				NameRef: port.nameRef,
				Port: port.port
			});
		})
	}
	let NodeSelector = [];
	if (operatorK8S.nodeSelector && operatorK8S.nodeSelector.length != 0) {
		NodeSelector = operatorK8S.nodeSelector;
	}

	return {
		abilityAffinity: operatorK8S.abilityAffinity,
		HostIpc: operatorK8S.hostIPC || false,
		HostNetwork: operatorK8S.hostNetwork || false,
		NotStacked: operatorK8S.notStacked,
		Replicas: operatorK8S.replicas,
		HostPort: hostPort,
		NodeSelector: NodeSelector,
	}
}

CommonService.ConvertOperatorServantToAdminK8S = (operatorServant) => {
	let serverServant = null;

	if (operatorServant != null) {
		serverServant = {};

		operatorServant.forEach(servant => {
			serverServant[servant.name] = {
				Capacity: servant.capacity,
				Connections: servant.connection,
				IsTars: servant.isTars,
				IsTcp: servant.isTcp,
				Name: servant.name,
				Port: servant.port,
				Threads: servant.thread,
				Timeout: servant.timeout,
			}
		})
	}

	return serverServant;
}

CommonService.ConvertOperatorOptionToAdminK8S = (operatorTServerSpec) => {
	let asyncThread = operatorTServerSpec.tars.asyncThread
	let serverImportant = operatorTServerSpec.important
	let serverSubType = operatorTServerSpec.subType

	return {
		AsyncThread: asyncThread,
		ServerImportant: serverImportant,
		ServerProfile: operatorTServerSpec.tars.profile,
		ServerTemplate: operatorTServerSpec.tars.template,
		ServerSubType: serverSubType,
	};
}

module.exports = CommonService