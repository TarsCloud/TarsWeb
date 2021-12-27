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
const MarketService = {};

MarketService.install = async (deploy) => {

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

	let serverOption = {};
	serverOption.ServerSubType = deploy.subtype || 'tars';
	serverOption.ServerTemplate = deploy.template;
	serverOption.ServerProfile = deploy.profile;
	serverOption.AsyncThread = deploy.asyncThread;

	return await DeployService.createServer(deploy.app, deploy.server, ServerServant, serverK8S, serverOption);
};

module.exports = MarketService;