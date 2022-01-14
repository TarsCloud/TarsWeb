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

const PodService = {};

PodService.searchPod = async (searchKey, c) => {

    // console.log(searchKey);

    let allEndpointItems = await CommonService.listObject("tendpoints");//, undefined, 5, c);

    c = allEndpointItems.body.metadata.continue;

    allEndpointItems = allEndpointItems.body.items;


    let filterItems = [];
    allEndpointItems.forEach(endpoint => {
        if (endpoint.spec.subType != CommonService.TServerType1) {
            return;
        }

        if (endpoint.status.pods.length <= 0) {
            return;
        }

        if (endpoint.metadata.name.indexOf(searchKey) != -1) {
            filterItems.push(endpoint);
        }
    });

    filterItems.sort((e1, e2) => {

        if (e1.status.pods[0].name < e2.status.pods[0].name) {
            return -1;
        } else if (e1.status.pods[0].name == e2.status.pods[0].name) {
            return 0;
        } else {
            return 1;
        }
    });

    // Count填充
    let result = {};
    result.continue = c;
    // Data填充
    result.Data = [];
    filterItems.forEach(item => {
        if (item.status.pods.length <= 0) {
            return;
        }

        item.status.pods.forEach(pod => {
            let elem = {};

            elem["id"] = CommonService.getServerId(item.spec.app, item.spec.server);
            elem["ServerId"] = CommonService.getServerId(item.spec.app, item.spec.server)
            elem["ServerApp"] = item.spec.app
            elem["ServerName"] = item.spec.server

            elem["PodId"] = pod.uid
            elem["PodName"] = pod.name
            elem["PodIp"] = pod.podIP
            elem["NodeIp"] = pod.hostIP
            elem["ServiceVersion"] = pod.id
            elem["SettingState"] = pod.settingState
            elem["PresentState"] = pod.presentState
            elem["CreateTime"] = pod.startTime
            elem["PresentMessage"] = pod.presentMessage;

            // console.log(pod);

            if (pod.containerStatuses && pod.containerStatuses.length > 0) {
                if (pod.containerStatuses[0].state.running) {
                    elem["PresentMessage"] = "success";
                    elem["StartTime"] = pod.containerStatuses[0].state.running.startedAt;
                }

                if (pod.containerStatuses[0].state.waiting) {
                    elem["PresentMessage"] = pod.presentMessage + " " + pod.containerStatuses[0].state.waiting.reason;
                }

                if (pod.containerStatuses[0].state.terminated) {
                    elem["PresentMessage"] = "terminated";
                }
            } else {
                elem["PresentMessage"] = pod.presentState + " : " + pod.presentMessage;
            }

            result.Data.push(elem);
        })
    })

    return {ret: 200, msg: 'succ', data: result};

}


PodService.podAliveSelect = async (filter) => {

    let labelSelector = CommonService.createLabelSelector(filter);

    let allEndpointItems = await CommonService.listObject("tendpoints", labelSelector);

    allEndpointItems = allEndpointItems.body.items;

    let filterItems = [];
    allEndpointItems.forEach(endpoint => {
        // if (endpoint.spec.subType != CommonService.TServerType1) {
        //     return;
        // }

        if (endpoint.status.pods.length <= 0) {
            return;
        }
        filterItems.push(endpoint);
    });

    filterItems.sort((e1, e2) => {

        if (e1.status.pods[0].name < e2.status.pods[0].name) {
            return -1;
        } else if (e1.status.pods[0].name == e2.status.pods[0].name) {
            return 0;
        } else {
            return 1;
        }
    });

    // Count填充
    let result = {};
    // Data填充
    result.Data = [];
    filterItems.forEach(item => {
        if (item.status.pods.length <= 0) {
            return;
        }

        item.status.pods.forEach(pod => {
            let elem = {};
            elem["ServerId"] = CommonService.getServerId(item.spec.app, item.spec.server)
            elem["ServerApp"] = item.spec.app
            elem["ServerName"] = item.spec.server
            elem["Pid"] = pod.pid
            elem["PodId"] = pod.uid
            elem["PodName"] = pod.name
            elem["PodIp"] = pod.podIP
            elem["NodeIp"] = pod.hostIP
            elem["SettingState"] = pod.settingState
            elem["PresentState"] = pod.presentState
            elem["CreateTime"] = pod.startTime
            elem["PresentMessage"] = pod.presentMessage;
            elem["ServiceVersion"] = '';

            if (pod.containerStatuses && pod.containerStatuses.length > 0) {

                let image = pod.containerStatuses[0].image.split(':');
                elem["ServiceVersion"] = image[image.length - 1];

                if (pod.containerStatuses[0].state.running) {
                    elem["PresentMessage"] = "success";
                    elem["StartTime"] = pod.containerStatuses[0].state.running.startedAt;
                }

                if (pod.containerStatuses[0].state.waiting) {
                    elem["PresentMessage"] = pod.presentMessage + " " + pod.containerStatuses[0].state.waiting.reason;
                }

                if (pod.containerStatuses[0].state.terminated) {
                    elem["PresentMessage"] = "terminated";
                }
            } else {
                elem["PresentMessage"] = pod.presentState + " : " + pod.presentMessage;
            }

            result.Data.push(elem);
        })
    })

    return {ret: 200, msg: 'succ', data: result};
}

PodService.podPerishedSelect = async (serverId) => {

    let allExitedPodItems = await CommonService.getObject("texitedrecords", CommonService.getTServerName(serverId));

    allExitedPodItems = allExitedPodItems.body;

    let filterItems = [];

    allExitedPodItems.pods.forEach(item => {
        filterItems.push({
            appName: allExitedPodItems.app,
            serverName: allExitedPodItems.server,
            tExitedPod: item
        });
    })

    filterItems.sort((e1, e2) => {
        if (e1.tExitedPod.deleteTime < e2.tExitedPod.deleteTime) {
            return 1;
        } else if (e1.tExitedPod.deleteTime == e2.tExitedPod.deleteTime) {
            return 0;
        } else {
            return -1;
        }
    });

    // Count填充
    let result = {};

    // Data填充
    result.Data = [];

    filterItems.forEach(item => {

        let elem = {};
        elem["ServerId"] = CommonService.getServerId(item.appName, item.serverName)
        elem["ServerApp"] = item.appName
        elem["ServerName"] = item.serverName
        elem["ServiceVersion"] = item.tExitedPod.id
        elem["CreateTime"] = item.tExitedPod.createTime
        elem["DeleteTime"] = item.tExitedPod.deleteTime

        elem["PodId"] = item.tExitedPod.uid
        elem["PodName"] = item.tExitedPod.name
        elem["PodIp"] = item.tExitedPod.podIP
        elem["NodeIp"] = item.tExitedPod.nodeIP

        result.Data.push(elem);
    });

    return {ret: 200, msg: 'succ', data: result};

}

PodService.deletePod = async (PodName) => {
   let data =  await CommonService.deletePod(PodName);
    return {ret: 200, msg: 'succ'};
}


module.exports = PodService;
