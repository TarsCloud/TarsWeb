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

const nodeSsh = require('node-ssh')
const NodeInfoDao = require('../../dao/NodeInfoDao');
const ResourceDao = require('../../dao/ResourceDao');
const ServerDao = require('../../dao/ServerDao');
const _ = require('lodash');
const fs = require('fs-extra');
const ResourceService = {};
const os = require('os');
const internalIp = require('internal-ip')
const webConf = require('../../../config/webConf').webConf;
// const path = require('path');
// const Util = require('../../tools/util');
const logger = require('../../logger');

ResourceService.listTarsNode = async(nodeName, curPage, pageSize) =>{
	return await NodeInfoDao.getNodeInfoList(nodeName, curPage, pageSize);
}

ResourceService.addNodeLabel = async (nodeName, name, value) => {

	let node = await NodeInfoDao.hasNodeNode(nodeName);

	if (!node) {
		return [];
	}

	if (node.label == '') {
		node.label = '{}';
	}

	let labels = JSON.parse(node.label);

	labels[name] = value;

	await NodeInfoDao.updateNodeLabel(nodeName, JSON.stringify(labels));

	return JSON.stringify(labels);
}

ResourceService.loadNodeLabel = async (nodeName) => {
	let node = await NodeInfoDao.hasNodeNode(nodeName);

	if (!node || node.label == '') {
		return {};
	}

	return node.label;
}

ResourceService.deleteNodeLabel = async (nodeName, name) => {
	let node = await NodeInfoDao.hasNodeNode(nodeName);

	if (!node || node.label == '') {
		return {};
	}

	let labels = JSON.parse(node.label);

	delete labels[name];

	await NodeInfoDao.updateNodeLabel(nodeName, JSON.stringify(labels));

	return JSON.stringify(labels);
}



/**
 * 批量检测并安装Tars node
 * @param ips
 * @returns {Array}
 */
ResourceService.connectTarsNode = async (paramsObj) => {
	return await ResourceService.doConnectTarsNode(paramsObj)
};

ResourceService.getTarsNode = async(webHost, paramsObj) => {

	let registryAddress = await ResourceService.getRegistryAddress();

	let shell = await fs.readFile(__dirname + '/tarsnode_install.sh', 'utf8');

	shell = shell.replace(/\$\{runuser\}/g, paramsObj.runuser || 'tars')
		.replace(/\$\{webHost\}/g, webHost)
		.replace(/\$\{machine_ip\}/g, paramsObj.ip)
		.replace(/\$\{registryAddress\}/g, registryAddress);

	return shell;

}

/**
 * 批量检测并安装Tars node
 * @param ips
 * @returns {Array}
 */
ResourceService.installTarsNodes = async (paramsObj) => {

	let registryAddress = await ResourceService.getRegistryAddress();
	let rst = [];
	let installTask = [];
	paramsObj.ips.forEach((ip) => {
		installTask.push(ResourceService.doInstallTarsNode(ip, registryAddress, paramsObj));
	});
	let installRst = await Promise.all(installTask);
	rst = rst.concat(installRst);
	return rst;
};

ResourceService.doConnectTarsNode = async (paramsObj) => {
	let ip = paramsObj.node_name;
	let shell = await fs.readFile(__dirname + '/tarsnode_connect.sh', 'utf8');

	// console.log('doConnectTarsNode1:', paramsObj);

	let rst = await ResourceService.execSSH(ip, shell, paramsObj);
	rst.installInfo = '';
	rst.node_name = ip;

	// console.log('doConnectTarsNode2:', rst);
	
	if (rst.rst) {
		if (rst.msg.indexOf('exists') > -1) {
			rst.connect = true;
			rst.exists = true;
		} else if (rst.msg.indexOf('none') > -1) {
			rst.connect = true;
			rst.exists = false;
		} else {
			rst.connect = false;
			rst.exists = false;
		}
	} else {
		rst.connect = false;
		rst.exists = false;
	}

	rst.connectInfo = rst.connect ? "#connectNodeList.connect.succ#": "#connectNodeList.connect.failed#";
	rst.existsInfo = rst.exists ? "#connectNodeList.exists.yes#": "#connectNodeList.exists.no#";

	if(rst.connect) {
		if(rst.exists) {
			rst.installInfo = "#connectNodeList.install.waitOverwrite#";
		} else {
			rst.installInfo = "#connectNodeList.install.waitNew#";
		}
	} else {
		rst.installInfo = "#connectNodeList.install.invalid#";
	}

	return rst;
};

ResourceService.getRegistryAddress = async () => {
	let registryAddress = [];

	if(process.env.TARS_PROXY) {
		let proxy = process.env.TARS_PROXY.split(',');

		for(var index in proxy) {
			let host = proxy[index].split(':');
	
			registryAddress.push('tcp -h ' + host[0] + ' -p ' + host[1]);			
		}
	}
	else {
		const registryInfo = await ResourceDao.getRegistryAddress();

		for(var index in registryInfo) {
			let host = registryInfo[index].locator_id.split(':');
	
			registryAddress.push('tcp -h ' + host[0] + ' -p ' + host[1]);
		}
	
	}

	return registryAddress.join(':');
}

/**
 * 安装单个Tars node
 * @param ip
 * @returns {*}
 */
ResourceService.doInstallTarsNode = async (ip, registryAddress, paramsObj) => {
	// console.log('doInstallTarsNode:', ip, registryAddress, paramsObj);

	try {
		let shell = await fs.readFile(__dirname + '/tarsnode_install.sh', 'utf8');

		let thisIp = webConf.host;
		if(thisIp == 'localip.tars.com') {
			thisIp = internalIp.v4.sync();
		}

		let port = process.env.PORT || webConf.port || '3000';

		let webHost = "http://" + thisIp + ":" + port;

		shell = shell.replace(/\$\{runuser\}/g, paramsObj.runuser)
			.replace(/\$\{webHost\}/g, webHost)
			.replace(/\$\{machine_ip\}/g, ip)
			.replace(/\$\{registryAddress\}/g, registryAddress);
	
		logger.info(shell);

		let rst = await ResourceService.execSSH(ip, shell, paramsObj);

		logger.info(rst);
		rst.stdout = rst.msg || "";
		if (rst.rst) {
            if (rst.msg.indexOf('node has installed') > -1) {
				rst.rst = false;
				rst.msg = '#api.resource.tarsNodeExist#';
            } else if (rst.msg.indexOf('node download error') > -1) {
				rst.msg = '#api.resource.downloadFail#';
				rst.rst = false;
			} else if (rst.msg.indexOf('registryAddress is empty') > -1) {
				rst.msg = '#api.resource.registryAddressIsEmpty#';
				rst.rst = false;
			} else if (rst.msg.indexOf('machine_ip is empty') > -1) {
				rst.msg = '#api.resource.machineIpIsEmpty#';
				rst.rst = false;
            } else if (rst.msg.indexOf('node installed success') > -1) {
				rst.msg = '#api.resource.installSuccess#';
			}else {
				rst.rst = false;
				rst.msg = '#api.resource.installFailed#';
			}
		}
		return rst;
	} catch (e) {
		return {
			ip: ip,
			rst: false,
			msg: '#api.resource.installFailed#'
		}
	}
};


/**
 * 批量卸载Tars node(不删除机器上文件)
 * @param ips
 * @returns {Array.<*>}
 */
ResourceService.uninstallTarsNode = async (ips) => {
	//若该ip对应的机器中还有服务，则不允许下线
	let rst = [];
	// let promiseList = [];
	let serverConfs = await ServerDao.getServerConfByNodeName(ips);

	for (let i = 0; i < ips.length; i++) {
		let ip = ips[i];
		let idx = _.findIndex(serverConfs, (serverConf) => {
			serverConf = serverConf.dataValues;
			return serverConf.node_name == ip;
		});
		if (idx != -1) {
			rst.push({
				ip: ip,
				rst: false,
				msg: '#api.resource.serverExist#'
			});
		}else{
			rst.push({
				ip: ip,
				rst: true,
				msg: '#api.resource.uninstallSuccess#'
			});
		}
	}
	let deleteIps = [];
	rst.forEach((r) => {
		if (r.rst === true) {
			deleteIps.push(r.ip);
		}
	});
	await NodeInfoDao.deleteNodeInfo(deleteIps);
	return rst;
};


// /**
//  * 批量卸载Tars node
//  * @param ips
//  * @returns {Array.<*>}
//  */
// ResourceService.uninstallTarsNodes = async (ips) => {
// 	//若该ip对应的机器中还有服务，则不允许下线
// 	let rst = [];
// 	let promiseList = [];
// 	let serverConfs = await ServerDao.getServerConfByNodeName(ips);
// 	for (let i = 0; i < ips.length; i++) {
// 		let ip = ips[i];
// 		let idx = _.findIndex(serverConfs, (serverConf) => {
// 			serverConf = serverConf.dataValues;
// 			return serverConf.node_name == ip;
// 		});
// 		if (idx != -1) {
// 			rst.push({
// 				ip: ip,
// 				rst: false,
// 				msg: '#api.resource.serverExist#'
// 			});
// 		} else {
// 			promiseList.push(ResourceService.doUninstallTarsNode(ip));
// 		}
// 	}
// 	let uninstallRst = await Promise.all(promiseList);
// 	let deleteIps = [];
// 	uninstallRst.forEach((uninstallRstItem) => {
// 		if (uninstallRstItem.rst === true) {
// 			deleteIps.push(uninstallRstItem.ip);
// 		}
// 	});
// 	await NodeInfoDao.deleteNodeInfo(deleteIps);
// 	return rst.concat(uninstallRst);
// };

/**
 * 卸载单个机器上的Tarsnode
 * @param ip
 * @returns {*}
 */
ResourceService.doUninstallTarsNode = async (ip) => {
	try {
		let shell = await fs.readFile(__dirname + '/tarsnode_uninstall.sh', 'utf8');
		let rst = await ResourceService.doSSHTask(ip, shell);
		if (rst.rst) {
			if (String(rst.msg).indexOf('Tars node uninstall success') > -1) {
				rst.msg = '#api.resource.uninstallSuccess#'
			} else {
				rst.rst = false;
				rst.msg = '#api.resource.uninstallFailed#'
			}
		}
		return rst;
	} catch (e) {
		return {
			ip: ip,
			rst: false,
			msg: '#api.resource.uninstallFailed#'
		}
	}
};

/**
//  * 获取ssh配置并执行ssh任务
//  * @param ip
//  * @param shell
//  * @returns {*}
//  */
// ResourceService.doSSHTask = async (ip, shell, paramsObj) => {
// 	// console.log('doSSHTask', ip, paramsObj);
	
// 	try {
// 		// let sshConf = await ResourceService.getSSHConfig(ip);
// 		let sshConf = paramsObj;
// 		if (!sshConf) {
// 			return {
// 				ip: ip,
// 				rst: false,
// 				msg: '#api.resource.notConfig#'
// 			}
// 		} else {
// 			return await ResourceService.execSSH(ip, shell, sshConf);
// 		}
// 	} catch (e) {
// 		return {
// 			ip: ip,
// 			rst: false,
// 			msg: '#api.resource.sshFailed#'
// 		}
// 	}
// };

// /**
//  * 获取ssh配置
//  * @param ip
//  * @returns {*}
//  */
// ResourceService.getSSHConfig = async (ip) => {
// 	try {
// 		let sshConf = false;
// 		if (resourceConf.getMachineConf) {
// 			let conf = false;
// 			try {
// 				conf = await Util.jsonRequest.get(resourceConf.getMachineConf, {ip: ip});
// 			} catch (e) {
// 				logger.error('getSSHConfig', e);
// 				conf = false;
// 			}
// 			if (_.isPlainObject(conf) && conf.ret_code == 200 && conf.data && conf.data.port != undefined && conf.data.username != undefined && conf.data.password != undefined) {
// 				sshConf = conf.data
// 				sshConf.ip = ip;
// 			} else {
// 				sshConf = false;
// 			}
// 		}
// 		if (!sshConf) {
// 			let sshConfs = await fs.readJson(path.join(__dirname, '../../../config/sshConf.json'));
// 			let index = _.findIndex(sshConfs || [], (o) => {
// 				return o.ip === ip
// 			});
// 			if (index > -1) {
// 				sshConf = sshConfs[index];
// 			} else {
// 				sshConf = false;
// 			}
// 		}
// 		return sshConf;
// 	} catch (e) {
// 		return false;
// 	}
// };

/**
 * 远程登录机器并执行ssh
 * @param ip
 * @param shell
 * @param sshConf
 * @returns {*}
 */
ResourceService.execSSH = async (ip, shell, sshConf) => {
	try {
		let ssh = new nodeSsh();
		await ssh.connect({
			host: ip,
			port: sshConf.port,
			username: sshConf.user,
			password: sshConf.password
		});
		let result = await ssh.execCommand(shell);
		// console.log(result);

		return {
			ip: ip,
			rst: result.code == 0,
			msg: result.code == 0 ? result.stdout : result.stderr
		};
	} catch (e) {
		// console.log(e);
		return {
			ip: ip,
			rst: false,
			msg: '#api.resource.sshFailed#'
		}
	}
};

module.exports = ResourceService;