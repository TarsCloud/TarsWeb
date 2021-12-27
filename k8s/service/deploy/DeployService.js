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
const logger = require('../../../logger');
const CommonService = require('../common/CommonService');
const ApplicationService = require('../application/ApplicationService');
const lodash = require("lodash");
const DeployService = {};

// //安装服务
// DeployService.installServer = async (ServerApp, ServerName, ServerServant, ServerK8S, ServerOption) => {

//     let server = await CommonService.getServer(ServerApp + '.' + ServerName);

//     if (server) {
//         return {
//             ret: 500,
//             msg: 'server exists'
//         };
//     }
//     let metadata = {
//         ServerApp: ServerApp,
//         BusinessName: '',
//         AppMark: '',
//     }
//     await ApplicationService.applicationCreate(metadata);
//     let tServer = await CommonService.buildTServer(ServerApp, ServerName, ServerServant, ServerK8S, ServerOption);
//     let data = await CommonService.createObject("tservers", tServer);
//     return {
//         ret: 200,
//         msg: 'succ',
//         data: data.body
//     };
// }

//创建服务
DeployService.createServer = async (ServerApp, ServerName, ServerServant, ServerK8S, ServerOption) => {

    let server = await CommonService.getServer(ServerApp + '.' + ServerName);

    if (server) {
        return {
            ret: 500,
            msg: 'server exists'
        };
    }
    let metadata = {
        ServerApp: ServerApp,
        BusinessName: '',
        AppMark: '',
    }
    await ApplicationService.applicationCreate(metadata);
    let tServer = await CommonService.buildTServer(ServerApp, ServerName, ServerServant, ServerK8S, ServerOption);
    let data = await CommonService.createObject("tservers", tServer);
    return {
        ret: 200,
        msg: 'succ',
        data: data.body
    };
}

//创建服务
DeployService.serverDeployCreate = async (metadata) => {
    let tDeploy = CommonService.buildTDeploy(metadata)

    let data = await CommonService.createObject("tdeploys", tDeploy);
    return {
        ret: 200,
        msg: 'succ',
        data: data.body
    };
}

//服务部署列表
DeployService.serverDeploySelect = async (Uid, ServerApp, ServerName, deployName) => {
    let filterItems = [];
    if (deployName) {
        let deploy = await CommonService.getObject("tdeploys", deployName);
        filterItems.push(deploy.body);
    } else {
        let labelSelector = `${CommonService.APPROVE}=Pending`;
        let allItems = await CommonService.listObject("tdeploys", labelSelector);
        allItems = allItems.body.items;
        for (let i = 0; i < allItems.length; i++) {
            let elem = allItems[i];
            if (ServerApp.length > 0 && elem.apply.app.indexOf(ServerApp) == -1) {
                continue;
            }
            if (ServerName.length > 0 && elem.apply.server.indexOf(ServerName) == -1) {
                continue;
            }
            filterItems.push(elem);
        }
        filterItems.sort((e1, e2) => {
            if (e1.metadata.creationTimestamp < e2.metadata.creationTimestamp) {
                return 1;
            } else if (e1.metadata.creationTimestamp == e2.metadata.creationTimestamp) {
                return 0;
            } else {
                return -1;
            }
        });
    }
    let result = {};
    // Data填充
    result.Data = [];
    filterItems.forEach(item => {
        let elem = {};

        elem["DeployId"] = item.metadata.name
        elem["RequestTime"] = item.metadata.creationTimestamp
        elem["ServerApp"] = item.apply.app
        elem["ServerName"] = item.apply.server

        elem["ServerK8S"] = CommonService.ConvertOperatorK8SToAdminK8S(item.apply.k8s)
        elem["Mounts"] = item.apply.k8s.mounts || [];
        elem["resources"] = item.apply.k8s.resources || {};
        elem["ServerServant"] = CommonService.ConvertOperatorServantToAdminK8S(item.apply.taf.servants)
        elem["ServerOption"] = CommonService.ConvertOperatorOptionToAdminK8S(item.apply)

        elem["RequestPerson"] = Uid;
        elem["RequestMark"] = item.apply.mark;

        result.Data.push(elem);
    });

    return {
        ret: 200,
        msg: 'succ',
        data: result
    };
}

DeployService.serverDeployUpdate = async (metadata, target) => {

    let tDeploy = await CommonService.getObject("tdeploys", metadata.DeployId);
    if (!tDeploy) {
        return {
            ret: 500,
            msg: 'no deploy server exists'
        };
    }
    tDeploy = tDeploy.body;
    let tServer = await CommonService.buildTServer(tDeploy.apply.app, tDeploy.apply.server, target.ServerServant, target.ServerK8S, target.ServerOption)
    let tDeployCopy = JSON.parse(JSON.stringify(tDeploy));
    tDeployCopy.apply = tServer.spec

    let K8S = lodash.cloneDeep(tDeployCopy.apply.k8s)
    //修改部分k8s节点下信息
    if (target.ServerK8S.abilityAffinity) {
        K8S.abilityAffinity = target.ServerK8S.abilityAffinity
    }
    if (target.ServerK8S.NodeSelector) {
        K8S.nodeSelector = target.ServerK8S.NodeSelector
    }
    K8S.hostIPC = target.ServerK8S.HostIpc || false
    K8S.hostNetwork = target.ServerK8S.HostNetwork || false
    K8S.resources = {}
    //k8s资源管理
    if (target.ServerK8S.resources.limitCpu || target.ServerK8S.resources.limitMem) {
        K8S.resources.limits = {}
        if (target.ServerK8S.resources.limitCpu) K8S.resources.limits.cpu = target.ServerK8S.resources.limitCpu + "m"
        if (target.ServerK8S.resources.limitMem) K8S.resources.limits.memory = target.ServerK8S.resources.limitMem + "m"
    }
    if (target.ServerK8S.resources.requestCpu || target.ServerK8S.resources.requestMem) {
        K8S.resources.requests = {}
        if (target.ServerK8S.resources.requestCpu) K8S.resources.requests.cpu = target.ServerK8S.resources.requestCpu + "m"
        if (target.ServerK8S.resources.requestMem) K8S.resources.requests.memory = target.ServerK8S.resources.requestMem + "m"
    }
    if (Object.keys(K8S.resources).length == 0) {
        delete K8S.resources
    }
    let mounts = []
    K8S.mounts.forEach(item => {
        if (!item.source.hasOwnProperty("tLocalVolume")) {
            mounts.push(item)
        }
    })
    target.ServerK8S.mounts.forEach(item => {
        if (item.name && item.mountPath) {
            mounts.push(item)
        }
    })
    K8S.mounts = mounts;

    if (target.ServerK8S.showHostPort) {
        K8S.hostPorts = [];
        target.ServerK8S.HostPortArr.forEach(v => {
            K8S.hostPorts.push({
                nameRef: v.obj,
                port: v.HostPort * 1
            });
        })
    }
    let deploy = JSON.parse(JSON.stringify(tDeployCopy));
    deploy.apply.k8s = K8S
    console.log("deploy:" + JSON.stringify(deploy, null, 4));
    let data = await CommonService.replaceObject("tdeploys", deploy.metadata.name, deploy);

    return {
        ret: 200,
        msg: 'succ',
        data: data.body
    };
}

DeployService.serverDeployDelete = async (metadata) => {

    let data = await CommonService.deleteObject("tdeploys", metadata.DeployId);

    return {
        ret: 200,
        msg: 'succ',
        data: data.body
    };
}

module.exports = DeployService;