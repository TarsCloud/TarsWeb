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
const DeployService = require('../../k8s/service/deploy/DeployService');
const CommonService = require('../../k8s/service/common/CommonService');

const MarketService = {};

MarketService.install = async (deploy, paramsObj) => {

	let ServerServant = {}

	deploy.servants.forEach(obj => {
		ServerServant[obj.name] = {
			Name: obj.name,
			Port: parseInt(obj.port),
			Threads: parseInt(obj.thread),
			Connections: parseInt(obj.connection),
			Capacity: parseInt(obj.capacity),
			IsTars: obj.isTars,
			IsTcp: obj.isTcp,
			Timeout: parseInt(obj.timeout),
		}
	});

	let serverK8S = {};
	serverK8S.HostPort = [];
	deploy.hostPorts.forEach(item => {
		serverK8S.HostPort.push({
			NameRef: item.nameRef,
			Port: item.port,
		})
	});

	serverK8S.NodeSelector = deploy.nodeSelector || [];
	serverK8S.Mounts = deploy.mounts || [];
	serverK8S.HostIpc = deploy.hostIpc || false;
	serverK8S.HostNetwork = deploy.hostNetwork || false;
	serverK8S.Replicas = deploy.replicas || 1;
	serverK8S.NotStacked = deploy.notStacked || true;
	serverK8S.AbilityAffinity = deploy.abilityAffinity || 'AppOrServerPreferred';

	let serverOption = {};
	serverOption.ServerSubType = deploy.subtype || 'tars';
	serverOption.ServerTemplate = deploy.template;
	serverOption.ServerProfile = deploy.profile;
	serverOption.AsyncThread = deploy.asyncThread;

	return await DeployService.install(deploy, ServerServant, serverK8S, serverOption, paramsObj);
};

MarketService.listInstall = async () => {

	let labelSelector = `${CommonService.TServerCloudInstall}`;

	let data = await CommonService.listObject("tservers", labelSelector);

	let items = [];

	data.body.items.forEach(item => {
		var v = item.metadata.labels;
		v[CommonService.TServerCloudLogo] = item.metadata.annotations[CommonService.TServerCloudLogo];
		v[CommonService.TServerCloudDigest] = item.metadata.annotations[CommonService.TServerCloudDigest];
		items.push(v);
	});

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

MarketService.upgrade = async (deploy, paramsObj) => {

	let ServerServant = {}

	deploy.servants.forEach(obj => {
		ServerServant[obj.name] = {
			Name: obj.name,
			Port: parseInt(obj.port),
			Threads: parseInt(obj.thread),
			Connections: parseInt(obj.connection),
			Capacity: parseInt(obj.capacity),
			IsTars: obj.isTars,
			IsTcp: obj.isTcp,
			Timeout: parseInt(obj.timeout),
		}
	});

	let serverK8S = {};
	serverK8S.HostPort = [];
	deploy.hostPorts.forEach(item => {
		serverK8S.HostPort.push({
			NameRef: item.nameRef,
			Port: item.port,
		})
	});

	serverK8S.NodeSelector = deploy.nodeSelector || [];
	serverK8S.Mounts = deploy.mounts || [];
	serverK8S.HostIpc = deploy.hostIpc || false;
	serverK8S.HostNetwork = deploy.hostNetwork || false;
	serverK8S.Replicas = deploy.replicas || 1;
	serverK8S.NotStacked = deploy.notStacked || true;
	serverK8S.AbilityAffinity = deploy.abilityAffinity || 'AppOrServerPreferred';

	let serverOption = {};
	serverOption.ServerSubType = deploy.subtype || 'tars';
	serverOption.ServerTemplate = deploy.template;
	serverOption.ServerProfile = deploy.profile;
	serverOption.AsyncThread = deploy.asyncThread;

	return await DeployService.upgrade(deploy, ServerServant, serverK8S, serverOption, paramsObj);
};

module.exports = MarketService;