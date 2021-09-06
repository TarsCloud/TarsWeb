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

const NodeProxy = require("../../../rpc/k8s-proxy/NodeProxy");
const {RPCClientPrx} = require('../../../rpc/service');
const {client} = require('../../../rpc/k8s');
const CommonService = require('../common/CommonService');
const logger = require('../../../logger');
const Telnet = require('telnet-client')
const NodeService = {};

NodeService.startServer = async (application, serverName, podIp) => {
    podIp = podIp.split(',') || []
    let rets = [];
    for (var i = 0, len = podIp.length; i < len; i++) {
        let target = podIp[i];
        let ret = {};
        try {

            logger.info(`startServer: ${target}, ${application}, ${serverName}`);

            let nodePrx = await RPCClientPrx(client, NodeProxy, 'tars', 'Node', `tars.tarsnode.NodeObj@tcp -h ${target} -p 19385 -t 3000`)
            ret = await nodePrx.startServer(application, serverName);
        } catch (e) {
            ret = {
                __return: -1,
                result: e
            }

            logger.error(`startServer: ${target}, ${application}, ${serverName}`, e);
        }


        rets.push({
            application: application,
            server_name: serverName,
            target,
            ret_code: ret.__return,
            err_msg: ret.result
        });
    }
    return rets;
}

NodeService.stopServer = async (application, serverName, podIp) => {
    podIp = podIp.split(',') || []
    let rets = [];
    for (var i = 0, len = podIp.length; i < len; i++) {
        let target = podIp[i];
        let ret = {};
        try {

            logger.info(`stopServer: ${target}, ${application}, ${serverName}`);

            let nodePrx = await RPCClientPrx(client, NodeProxy, 'tars', 'Node', `tars.tarsnode.NodeObj@tcp -h ${target} -p 19385 -t 3000`)
            ret = await nodePrx.stopServer(application, serverName);
        } catch (e) {
            ret = {
                __return: -1,
                result: e
            }

            logger.error(`stopServer: ${target}, ${application}, ${serverName}`, e);
        }

        rets.push({
            application: application,
            server_name: serverName,
            target,
            ret_code: ret.__return,
            err_msg: ret.result
        });
    }
    return rets;
}

NodeService.restartServer = async (application, serverName, podIp) => {
    podIp = podIp.split(',') || []
    let rets = [];
    for (var i = 0, len = podIp.length; i < len; i++) {
        let target = podIp[i];
        let ret = {};
        try {

            logger.info(`restartServer: ${target}, ${application}, ${serverName}`);

            let nodePrx = await RPCClientPrx(client, NodeProxy, 'tars', 'Node', `tars.tarsnode.NodeObj@tcp -h ${target} -p 19385 -t 3000`)
            ret = await nodePrx.restartServer(application, serverName);
        } catch (e) {
            ret = {
                __return: -1,
                result: e
            }
            logger.error(`restartServer: ${target}, ${application}, ${serverName}`, e);
        }

        rets.push({
            application: application,
            server_name: serverName,
            target,
            ret_code: ret.__return,
            err_msg: ret.result
        });
    }
    return rets;
}

NodeService.doCommand = async (application, serverName, podIp, command) => {
    podIp = podIp.split(',') || []
    let rets = [];
    for (var i = 0, len = podIp.length; i < len; i++) {
        let target = podIp[i];
        let ret = {};
        try {

            logger.info(`doCommand: ${command}, ${target}, ${application}, ${serverName}`);

            let nodePrx = await RPCClientPrx(client, NodeProxy, 'tars', 'Node', `tars.tarsnode.NodeObj@tcp -h ${target} -p 19385 -t 3000`)
            ret = await nodePrx.notifyServer(application, serverName, command);
        } catch (e) {
            ret = {
                __return: -1,
                result: e
            }

            logger.error(`doCommand: ${target}, ${application}, ${serverName}`, e);
        }

        rets.push({
            application: application,
            server_name: serverName,
            target,
            ret_code: ret.__return,
            err_msg: ret.result,
            ret,
        });
    }
    return rets;
}

NodeService.nodeSelect = async (isAll, NodeName, NodeMark, limiter) => {

    let nodeList = await CommonService.getNodeList();

    let allItems = nodeList;

    // filter
    let filterItems = allItems;

    if (!isAll) {
        filterItems = [];

        allItems.forEach(elem => {

            if (NodeName.length > 0 && elem.metadata.name.indexOf(NodeName) == -1)
                return;

            filterItems.push(elem);
        });
    }

    allItems = filterItems;

    // limiter
    if (limiter != null) {
        let {start, stop} = CommonService.pageList(filterItems.length, limiter);

        filterItems = filterItems.slice(start, stop);
    }

    // nodeDetails := nodeLabelRecord.ListNodeDetail()

    let result = {
        Data: [],
        Count: {},
    }
    result.Count["AllCount"] = filterItems.length;
    result.Count["FilterCount"] = allItems.length;

    nodeList.sort(function (e1, e2) {
        if (e1.metadata.name < e2.metadata.name) {
            return -1;
        } else if (e1.metadata.name == e2.metadata.name) {
            return 0;
        }
        return 1;
    })

    filterItems.forEach(item => {

        let publicFlag = false;
        let ability = [];
        for (let key in item.metadata.labels) {

            if (key.indexOf(CommonService.NodeAppAbilityLabelPrefix) == 0) {
                ability.push(key.substr(CommonService.NodeAppAbilityLabelPrefix.length));
            }

            if (key.indexOf(CommonService.PublicNodeLabel) == 0) {
                publicFlag = true;
            }
        }

        // console.log(item.metadata.labels);

        let elem = {
            "NodeName": item.metadata.name,
            "NodeAbility": ability,
            "NodeAddress": item.status.addresses,
            "NodInfo": item.status.nodeInfo,
            "NodePublic": publicFlag,
            "Labels": item.metadata.labels
        }
        result.Data.push(elem);

    })

    return {ret: 200, msg: 'succ', data: result};
}

NodeService.nodeList = async () => {

    let nodeList = await CommonService.getNodeList();

    let result = [];
    nodeList.forEach(node => {
        result.push(node.metadata.name);
    });

    return {ret: 200, msg: 'succ', data: result};
}

NodeService.nodeStartPublic = async (metadata) => {

    let k8sNode = await CommonService.readNode(metadata.NodeName);

    if (k8sNode && k8sNode.body) {

        k8sNode = k8sNode.body;

        k8sNode.metadata.labels[CommonService.PublicNodeLabel] = "";

        await CommonService.replaceNode(k8sNode.metadata.name, k8sNode);
    }

    return {ret: 200, msg: 'succ'};
}

NodeService.nodeStopPublic = async (metadata) => {

    let k8sNode = await CommonService.readNode(metadata.NodeName);

    if (k8sNode && k8sNode.body) {

        k8sNode = k8sNode.body;

        delete k8sNode.metadata.labels[CommonService.PublicNodeLabel];

        await CommonService.replaceNode(k8sNode.metadata.name, k8sNode);
    }

    return {ret: 200, msg: 'succ'};
}

NodeService.checkNode = async (node, port) => {
    let nodeInfo = await CommonService.readNode(node);
    let InternalIP = nodeInfo.body.status.addresses.filter(item => item.type.toLowerCase() == "internalip")[0].address;
    try {
        let telnetParam = {
            host: InternalIP,
            port: port,
            negotiationMandatory: false,
            timeout: 15
        }
        let connection = new Telnet();
        await connection.connect(telnetParam);
        await connection.end()
        return {ret: 0, node, port, InternalIP}
    } catch (e) {
        return {ret: -1, node, port, InternalIP}
    }
}

module.exports = NodeService;
