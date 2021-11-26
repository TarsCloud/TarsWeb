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
const axios = require('axios');
const K8sService = {};


K8sService.serverK8SSelect = async (ServerId, limiter) => {

    let v = ServerId.split(".");

    let labelSelector = `${CommonService.TServerAppLabel}=${v[0]},${CommonService.TServerNameLabel}=${v[1]}`;

    let filterItems = (await CommonService.listObject("tservers", labelSelector)).body.items;

    // limiter
    if (limiter != null) {
        let {start, stop} = CommonService.pageList(filterItems.length, limiter);
        filterItems = filterItems.slice(start, stop);
    }
    // console.log("filterItems:" + JSON.stringify(filterItems, null, 4));
    // Count填充
    let result = {}; //&models.SelectResult{}
    result.Count = {};//make(models.MapInt)
    result.Count["AllCount"] = filterItems.length;
    result.Count["FilterCount"] = filterItems.length;

    // Data填充
    result.Data = []; //make(models.ArrayMapInterface, 0, len(filterItems))

    filterItems.forEach(item => {
        let elem = {};
        elem["ServerId"] = CommonService.getServerId(item.spec.app, item.spec.server)
        elem["ServerApp"] = item.spec.app
        elem["ServerName"] = item.spec.server
        elem["Replicas"] = item.spec.k8s.replicas
        elem["NodeSelector"] = item.spec.k8s.nodeSelector
        elem["HostIpc"] = item.spec.k8s.hostIPC || false
        elem["HostNetwork"] = item.spec.k8s.hostNetwork || false
        elem["HostPort"] = item.spec.k8s.hostPorts
        elem["resources"] = item.spec.k8s.resources
        elem["mounts"] = item.spec.k8s.mounts || []
        elem["kind"] = item.kind
        elem["version"] = item.apiVersion
        elem["name"] = item.metadata.name
        elem["abilityAffinity"] = item.spec.k8s.abilityAffinity
        result.Data.push(elem);
    })
    return {ret: 200, msg: 'succ', data: result};
}

K8sService.serverK8SUpdate = async (metadata, target) => {
    let tServer = await CommonService.getServer(CommonService.getTServerName(metadata.ServerId));
    if (!tServer) {
        return {ret: 500, msg: "server not exists"};
    }
    tServer = tServer.body;
    let K8S = tServer.spec.k8s
    if (target.Replicas!=null) {
        K8S.replicas = target.Replicas
    }
    if (target.NodeSelector) {
        K8S.nodeSelector = target.NodeSelector
    }
    if (target.abilityAffinity){
        K8S.abilityAffinity = target.abilityAffinity
    }
    let tServerCopy = JSON.parse(JSON.stringify(tServer));
    tServerCopy.spec.k8s = K8S
    let data = await CommonService.replaceObject("tservers", tServerCopy.metadata.name, tServerCopy);
    return {ret: 200, msg: 'succ', data: data.body};
}

K8sService.ServerK8SUpdateResource = async (metadata, target) => {
    let tServer = await CommonService.getServer(CommonService.getTServerName(metadata.ServerId));
    if (!tServer) {
        return {ret: 500, msg: "server not exists"};
    }
    tServer = tServer.body;
    let K8S = tServer.spec.k8s
    K8S.resources = {}
    //k8s资源管理
    if (target.limitCpu || target.limitMem) {
        K8S.resources.limits = {}
        if (target.limitCpu) K8S.resources.limits.cpu = target.limitCpu + "m"
        if (target.limitMem) K8S.resources.limits.memory = target.limitMem + "m"
    }
    if (target.requestCpu || target.requestMem) {
        K8S.resources.requests = {}
        if (target.requestCpu) K8S.resources.requests.cpu = target.requestCpu + "m"
        if (target.requestMem) K8S.resources.requests.memory = target.requestMem + "m"
    }
    if (Object.keys(K8S.resources).length == 0) {
        delete K8S.resources
    }
    let tServerCopy = JSON.parse(JSON.stringify(tServer));
    tServerCopy.spec.k8s = K8S
    let data = await CommonService.replaceObject("tservers", tServerCopy.metadata.name, tServerCopy);
    return {ret: 200, msg: 'succ', data: data.body};
}

K8sService.ServerK8SUpdateNetwork = async (metadata, target) => {
    let tServer = await CommonService.getServer(CommonService.getTServerName(metadata.ServerId));
    if (!tServer) {
        return {ret: 500, msg: "server not exists"};
    }
    tServer = tServer.body;
    let K8S = tServer.spec.k8s;
    K8S.hostIPC = target.HostIpc;
    K8S.hostNetwork = target.HostNetwork;
    if (target.showHostPort) {
        K8S.hostPorts = [];
        target.HostPort.forEach(v => {
            K8S.hostPorts.push({
                nameRef: v.NameRef,
                port: v.Port
            });
        })
    } else {
        delete K8S.hostPorts
    }
    let tServerCopy = JSON.parse(JSON.stringify(tServer));
    tServerCopy.spec.k8s = K8S
    let data = await CommonService.replaceObject("tservers", tServerCopy.metadata.name, tServerCopy);
    return {ret: 200, msg: 'succ', data: data.body};
}

K8sService.ServerK8SUpdateDisk = async (metadata, target) => {
    let tServer = await CommonService.getServer(CommonService.getTServerName(metadata.ServerId));
    if (!tServer) {
        return {ret: 500, msg: "server not exists"};
    }
    tServer = tServer.body;
    let K8S = tServer.spec.k8s;
    let mounts = [];
    if (K8S.mounts){
        K8S.mounts.forEach(item=>{
            if (!item.source.hasOwnProperty("tLocalVolume")){
                mounts.push(item)
            }
        })
    }
    target.mounts.forEach(item => {
        let tLocalVolume = item.source.tLocalVolume
        item.source.tLocalVolume = {
            uid: tLocalVolume.uid || "0",
            gid: tLocalVolume.gid || "0",
            mode: tLocalVolume.mode || "755"
        }
        mounts.push(item)
    })
    K8S.mounts = mounts;
    let tServerCopy = JSON.parse(JSON.stringify(tServer));
    tServerCopy.spec.k8s = K8S
    let data = await CommonService.replaceObject("tservers", tServerCopy.metadata.name, tServerCopy);
    return {ret: 200, msg: 'succ', data: data.body};
}


K8sService.selectAvailHostPort = async (NodeName, NodePort) => {
    let pod = await CommonService.getDaemonPodByName(NodeName)
    if (!pod) {
        return { ret: 500, msg: 'pod not exists' };
    }
    let containers = pod.spec.containers
    if (containers.length <= 0) {
        return { ret: 500, msg: 'pod no container' };
    }
    let ports = containers[0].ports;

    if (ports <= 0) {
        return { ret: 500, msg: 'pod has no host port' };
    }

    // console.log(NodeName, NodePort, pod, containers);

    let hostIp = pod.status.hostIP
    let hostPort = containers[0].ports[0].hostPort
    // let hostPort = 8000;

    // proxy forward
    let rsp = await axios.get(`http://${hostIp}:${hostPort}/port?host=${hostIp}&port=${NodePort}`);
    if (!rsp) {
        return { ret: 500, msg: 'pod has no host port' };
    }

    // console.log(rsp);

    if (rsp.status == 200) {
        return { ret: 200, msg: 'succ', data: rsp.data };
    }
    return { ret: 500, msg: 'pod can access host port' };

    // // rsp, err := http.Get(fmt.Sprintf("http://%s:%d/port?host=%s&port=%d", hostIp, hostPort, hostIp, *params.Port))
    // // if err != nil {
    // // 	return agent.NewSelectAvailHostPortInternalServerError().WithPayload(&models.Error{Code: -1, Message: err.Error()})
    // // }
    // // defer rsp.Body.Close()

    // body, err := ioutil.ReadAll(rsp.Body)
    // if err != nil {
    // 	return agent.NewSelectAvailHostPortInternalServerError().WithPayload(&models.Error{Code: -1, Message: err.Error()})
    // }

    // if rsp.StatusCode == 500 {
    // 	return agent.NewSelectAvailHostPortInternalServerError().WithPayload(&models.Error{Code: -1, Message: string(body)})
    // } else {
    // 	return agent.NewSelectAvailHostPortOK().WithPayload(&agent.SelectAvailHostPortOKBody{Result: string(body)})
    // }
}


module.exports = K8sService;
