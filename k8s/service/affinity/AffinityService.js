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

const AffinityService = {};

AffinityService.affinityListByNode = async (NodeNames) => {

    let nodeList = [];

    for (let i = 0; i < NodeNames.length; i++) {
        let node = await CommonService.readNode(NodeNames[i]);
        nodeList.push(node.body);
    }

    let nodeAbility = [];

    nodeList.forEach(node => {
        let appArray = [];

        for (let key in node.metadata.labels) {
            if (key.indexOf(CommonService.NodeAppAbilityLabelPrefix) == 0) {
                appArray.push(key.substr(CommonService.NodeAppAbilityLabelPrefix.length));
            }
        }

        nodeAbility.push({
            NodeName: node,
            ServerApp: appArray,
        });
    });


	let result = {
		Data: {},
		Count: {},
	}

    result.Count["AllCount"] = nodeAbility.length;
    result.Count["FilterCount"] = nodeAbility.length;

    result.Data = nodeAbility;

    return { ret: 200, msg: 'succ', data: result };

}

//输出: <应用, 节点列表>
AffinityService.affinityListByServer = async (NodeName, ServerApp, ServerName) => {
    //<app, nodeName[]>
    let appNodeName = new Map();
    let affinity = ServerName == "" ? ServerApp : ServerApp + "." + ServerName;
    let nodeList = [];

    if (NodeName) {
        let node = await CommonService.readNode(NodeName);
        nodeList.push(node.body);
    } else {
        nodeList = await CommonService.getNodeList();
    }

    nodeList.forEach(node => {

        let appArray = [];
        for (let key in node.metadata.labels) {

            if (key.indexOf(CommonService.NodeAppAbilityLabelPrefix) == 0) {
                appArray.push(key.substr(CommonService.NodeAppAbilityLabelPrefix.length));
            }
        }

        appArray.forEach(affinityName => {
            if (!affinity || affinityName == affinity || affinityName.startsWith(affinity + ".")) {

                if (!appNodeName.has(affinityName)) {
                    appNodeName.set(affinityName, []);
                }

                appNodeName.get(affinityName).push(node.metadata.name);
            }
        })
    });

    let abilityNode = [];

    appNodeName.forEach((value, key) => {
        let arr = key.split('.')
        abilityNode.push({
            "ServerApp": arr[0],
            "ServerName": arr[1] || "",
            "NodeName": value,
        })
    });
	let result = {
        Data: [],
		Count: {},
	}
    result.Count["AllCount"] = abilityNode.length;
    result.Count["FilterCount"] = abilityNode.length;
    result.Data = abilityNode;
    return { ret: 200, msg: 'succ', data: result };
}

AffinityService.addNodeAbility = async (nodeName, serverApps) => {

    let nodeList = await CommonService.getNodeList();

    let k8sNode = nodeList.find(item => {
        return item.metadata.name == nodeName
    });

    if (!k8sNode) {
        return { ret: 500, msg: 'no node' };
    }

    let addAnyLabel = false;

    let k8sNodeCopy = await CommonService.readNode(k8sNode.metadata.name);
    k8sNodeCopy = k8sNodeCopy.body;

    serverApps.forEach(app => {
        let abilityLabel = CommonService.NodeAppAbilityLabelPrefix + app

        if (!k8sNodeCopy.metadata.labels[abilityLabel]) {
            addAnyLabel = true;
            k8sNodeCopy.metadata.labels[abilityLabel] = "";
        }
    })

    if (addAnyLabel) {

        await CommonService.replaceNode(nodeName, k8sNodeCopy);
	}

    return { ret: 200, msg: 'succ'};
}

AffinityService.affinityAddServer = async (NodeName, ServerApps) => {

    return AffinityService.addNodeAbility(NodeName, ServerApps);
}

AffinityService.affinityAddNode = async (NodeNames, ServerApp,ServerName) => {

    for (let i = 0; i < NodeNames.length; i++) {
        let node = NodeNames[i];
        let affinity = ServerName == "" ? ServerApp : ServerApp + "." + ServerName;
        await AffinityService.addNodeAbility(node, [affinity]);
    };

    return { ret: 200, msg: 'succ'};
}

AffinityService.deleteNodeAbility = async (nodeName, serverApp) => {

    let nodeList = await CommonService.getNodeList();

    let k8sNode = nodeList.find(item => {
        return item.metadata.name == nodeName
    });

    if (!k8sNode) {
        return { ret: 500, msg: 'no node' };
    }

	let deletedAnyLabel = false

    let k8sNodeCopy = await CommonService.readNode(k8sNode.metadata.name);

    if (k8sNodeCopy && k8sNodeCopy.body) {
        k8sNodeCopy = k8sNodeCopy.body;
    }


    serverApp.forEach(app => {
        let abilityLabel = CommonService.NodeAppAbilityLabelPrefix + app

        if (!k8sNodeCopy.metadata.labels[abilityLabel]) {
            deletedAnyLabel = true;
            delete k8sNodeCopy.metadata.labels[abilityLabel];
        }
    })


    if (deletedAnyLabel) {
        // let patch = { "op": "replace", "path": "/metadata/labels", "value": k8sNodeCopy.metadata.labels }

        // await k8sCoreApi.patchNode(nodeName, patch);
        await CommonService.replaceNode(nodeName, k8sNodeCopy);
    }

    return { ret: 200, msg: 'succ'};
}

AffinityService.affinityDeleteServer = async (NodeName, ServerApps) => {

    return AffinityService.deleteNodeAbility(NodeName, ServerApps);
}

AffinityService.affinityDeleteNode = async (NodeNames, ServerApp, ServerName, Force) => {
    if (Force != 'true') {
        if (await CommonService.hasAppName(ServerApp)) {
            return { ret: 500, msg: `application ${ServerApp} exists, can not be deleted!` };
        }
    }
    let affinity = ServerName == "" ? ServerApp : ServerApp + "." + ServerName;
    for (let i = 0; i < NodeNames.length; i++) {
        let node = NodeNames[i];
        await AffinityService.deleteNodeAbility(node, [affinity]);
    };

    return { ret: 200, msg: 'succ'};
}

module.exports = AffinityService;
