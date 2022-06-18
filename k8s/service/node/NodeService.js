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

const {
    adminRegPrx
} = require('../../../rpc/k8s');

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

            ret = await adminRegPrx.startServer(application, serverName, target);

            logger.info(`startServer: ${target}, ${application}, ${serverName}`, ret);

        } catch (e) {
            ret = {
                __return: -1,
                result: e
            }

            logger.error(`startServer: ${target}, ${application}, ${serverName}`, e);
        }


        rets.push({
            application: application,
            serverName: serverName,
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

            ret = await adminRegPrx.stopServer(application, serverName, target);

            logger.info(`stopServer: ${target}, ${application}, ${serverName}`, ret);
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

            ret = await adminRegPrx.restartServer(application, serverName, target);

            logger.info(`restartServer: ${target}, ${application}, ${serverName}`, ret);
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

            ret = await adminRegPrx.notifyServer(application, serverName, target, command);

            logger.info(`doCommand: ${target}, ${application}, ${serverName}`, ret);
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

NodeService.nodeSelect = async (localPV, hold, limiter) => {


    let nodeList = await CommonService.getNodeListAll(localPV, hold);
    // let affinity = ServerName == "" ? ServerApp : ServerApp + "." + ServerName;

    let allItems = nodeList;

    // console.log(isAll, NodeName, ServerApp, ServerName, affinity);

    // filter
    let filterItems = allItems;

    // if (!isAll) {
    //     filterItems = [];
    //     allItems.forEach(elem => {

    //         console.log(elem.metadata.name, elem.metadata.labels);

    //         if (NodeName.length > 0 && elem.metadata.name.indexOf(NodeName) == -1)
    //             return;

    //         let abilityFlag = false;
    //         if (affinity.length > 0) {
    //             for (let labelsKey in elem.metadata.labels) {
    //                 if (labelsKey.indexOf(CommonService.NodeAppAbilityLabelPrefix + affinity) != -1) {
    //                     abilityFlag = true;
    //                     break;
    //                 }
    //             }
    //         } else {
    //             abilityFlag = true;
    //         }
    //         if (!abilityFlag) return;

    //         filterItems.push(elem);
    //     });
    // }
    let result = {
        Data: [],
        Count: {},
    }
    result.Count["AllCount"] = allItems.length;

    allItems = filterItems;

    // limiter
    if (limiter != null) {
        let {
            start,
            stop
        } = CommonService.pageList(filterItems.length, limiter);

        filterItems = filterItems.slice(start, stop);
    }

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
        let ability = [],
            abilityLabels = {},
            commonLabels = {};
        for (let key in item.metadata.labels) {
            if (key.indexOf(CommonService.NodeAppAbilityLabelPrefix) == 0) {
                ability.push(key.substr(CommonService.NodeAppAbilityLabelPrefix.length));
                abilityLabels[key] = item.metadata.labels[key]
            } else {
                // let commonLabel = {};
                commonLabels[key] = item.metadata.labels[key]
            }
            if (key.indexOf(CommonService.NodeFramworkAbilityLabelPrefix) == 0) {
                publicFlag = true;
            }
        }

        let elem = {
            "NodeName": item.metadata.name,
            "CreationTimestamp": item.metadata.creationTimestamp,
            "Conditions": item.status.conditions,
            "Images": item.status.images,
            "NodeAbility": ability,
            "NodeAddress": item.status.addresses,
            "NodInfo": item.status.nodeInfo,
            "NodePublic": publicFlag,
            "Labels": item.metadata.labels,
            "Taints": item.spec.taints || [],
            abilityLabels,
            commonLabels
        }
        result.Data.push(elem);
    })

    return {
        ret: 200,
        msg: 'succ',
        data: result
    };
}

NodeService.nodeList = async () => {

    let nodeList = await CommonService.getNodeList();

    let result = [];
    nodeList.forEach(node => {
        result.push(node.metadata.name);
    });

    return {
        ret: 200,
        msg: 'succ',
        data: result
    };
}

NodeService.openAbility = async (metadata) => {
    let k8sNode = await CommonService.readNode(metadata.NodeName);
    if (k8sNode && k8sNode.body) {
        k8sNode = k8sNode.body;
        k8sNode.metadata.labels[CommonService.NodeFramworkAbilityLabelPrefix] = "";
        await CommonService.replaceNode(k8sNode.metadata.name, k8sNode);
    }
    return {
        ret: 200,
        msg: 'succ'
    };
}

NodeService.closeAbility = async (metadata) => {
    let k8sNode = await CommonService.readNode(metadata.NodeName);
    if (k8sNode && k8sNode.body) {
        k8sNode = k8sNode.body;
        delete k8sNode.metadata.labels[CommonService.NodeFramworkAbilityLabelPrefix];
        await CommonService.replaceNode(k8sNode.metadata.name, k8sNode);
    }
    return {
        ret: 200,
        msg: 'succ'
    };
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
        return {
            ret: 0,
            node,
            port,
            InternalIP
        }
    } catch (e) {
        return {
            ret: -1,
            node,
            port,
            InternalIP
        }
    }
}

NodeService.editCommonTag = async (metadata) => {
    let k8sNode = await CommonService.readNode(metadata.nodeName);
    if (k8sNode && k8sNode.body) {
        k8sNode = k8sNode.body;
        for (let label in k8sNode.metadata.labels) {
            if (!label.startsWith(CommonService.NodeFramworkAbilityLabelPrefix) &&
                !label.startsWith(CommonService.NodeAppAbilityLabelPrefix)) {
                delete k8sNode.metadata.labels[label];
            }
        }
        for (let item of metadata.tags) {
            k8sNode.metadata.labels[item.name] = item.value;
        }
        await CommonService.replaceNode(k8sNode.metadata.name, k8sNode);
    }
    return {
        ret: 200,
        msg: 'succ'
    };
}


NodeService.batchEditCommonTag = async (metadata) => {
    for (let node of metadata.nodeNames) {
        let k8sNode = await CommonService.readNode(node);
        if (k8sNode && k8sNode.body) {
            k8sNode = k8sNode.body;
            for (let item of metadata.tags) {
                if (!item.name.startsWith(CommonService.NodeFramworkAbilityLabelPrefix) &&
                    !item.name.startsWith(CommonService.NodeAppAbilityLabelPrefix)) {
                    k8sNode.metadata.labels[item.name] = item.value;
                }
            }
            await CommonService.replaceNode(k8sNode.metadata.name, k8sNode);
        }
    }
    return {
        ret: 200,
        msg: 'succ'
    };
}

NodeService.editAbilityTag = async (metadata) => {
    let k8sNode = await CommonService.readNode(metadata.nodeName);
    if (k8sNode && k8sNode.body) {
        k8sNode = k8sNode.body;
        for (let label in k8sNode.metadata.labels) {
            if (label.startsWith(CommonService.NodeAppAbilityLabelPrefix)) {
                delete k8sNode.metadata.labels[label];
            }
        }
        for (let item of metadata.tags) {
            if (!item.application) {
                throw new Error("application can not be null")
            }
            let tagName = CommonService.NodeAppAbilityLabelPrefix + item.application
            item.serverName ? tagName += `.${item.serverName}` : tagName
            k8sNode.metadata.labels[tagName] = "";
        }
        await CommonService.replaceNode(k8sNode.metadata.name, k8sNode);
    }
    return {
        ret: 200,
        msg: 'succ'
    };
}

NodeService.batchEditAbilityTag = async (metadata) => {
    for (let node of metadata.nodeNames) {
        let k8sNode = await CommonService.readNode(node);
        if (k8sNode && k8sNode.body) {
            k8sNode = k8sNode.body;
            for (let item of metadata.tags) {
                if (!item.application) {
                    throw new Error("application can not be null")
                }
                let tagName = CommonService.NodeAppAbilityLabelPrefix + item.application
                item.serverName ? tagName += `.${item.serverName}` : tagName
                k8sNode.metadata.labels[tagName] = "";
            }
            await CommonService.replaceNode(k8sNode.metadata.name, k8sNode);
        }
    }
    return {
        ret: 200,
        msg: 'succ'
    };
}

module.exports = NodeService;