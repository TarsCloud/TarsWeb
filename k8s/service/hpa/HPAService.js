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
const HPAService = {};
const hpaConfig = require('../../../config/hpaConfig')

HPAService.GROUP = "autoscaling"
HPAService.VERSION = "v2beta2"
HPAService.KIND = "HorizontalPodAutoscaler"
HPAService.HPAPLURAL = "horizontalpodautoscalers"

//系统指标名称
HPAService.SYS_TARGET = ["cpu", "memory"]
//查询没有查询到的话默认指标名称
HPAService.CUSTOM_TARGET = ["ts_adapter_queue", "ts_requests_timeout_ratio", "ts_requests_per_second"];

HPAService.HPACreate = async (ServerId, target) => {
    let tHpa = {
        apiVersion: HPAService.GROUP + "/" + HPAService.VERSION,
        kind: HPAService.KIND,
        metadata: {
            name: target.name,
        },
        spec: {
            scaleTargetRef: {
                apiVersion: target.version,
                kind: target.kind,
                name: target.name,
            }
        },
    };
    let SPEC = tHpa.spec
    if (target.minReplicas && target.maxReplicas) {
        SPEC.minReplicas = target.minReplicas * 1
        SPEC.maxReplicas = target.maxReplicas * 1
    }
    if (target.indicatorData) {
        SPEC.metrics = [];
        target.indicatorData.forEach(item => {
            let metricItem = {}
            let config = getMatchLabel(item.name);
            let matchTarget = config.target.filter(v => v.type.toLowerCase() == item.targetType.toLowerCase())[0]
            if (config.type.toLowerCase() == "resource") { //资源类型
                metricItem.type = "Resource"
                metricItem.resource = {
                    name: item.name.toLowerCase(),
                    target: {}
                }
                if (item.targetType.toLowerCase() == "averagevalue".toLowerCase()) {
                    metricItem.resource.target.type = "AverageValue" //平均值
                    metricItem.resource.target.averageValue = item.value * 1 + matchTarget.suffix
                } else {
                    metricItem.resource.target.type = "Utilization" //平均利用率
                    metricItem.resource.target.averageUtilization = item.value * 1
                }
            }

            if (config.type.toLowerCase() == "object") { //对象
                let targets = {}
                if (item.targetType.toLowerCase() == "averageValue".toLowerCase()) {
                    targets.type = "AverageValue"
                    targets.averageValue = item.value * 1 + matchTarget.suffix
                }
                let describedObject = {
                    apiVersion: target.version,
                    kind: target.kind,
                    name: target.name,
                };
                metricItem.type = "Object"
                metricItem.object = {
                    metric: {
                        name: item.name
                    },
                    describedObject,
                    target: targets
                }
            }
            SPEC.metrics.push(metricItem)
        })
    }
    tHpa.spec = SPEC;
    let remoteHpa = await HPAService.getHPAByName(target.name);
    let data
    if (remoteHpa.data) {
        data = await CommonService.replaceObject(HPAService.HPAPLURAL, target.name, tHpa, HPAService.GROUP, HPAService.VERSION);
    } else {
        data = await CommonService.createObject(HPAService.HPAPLURAL, tHpa, HPAService.GROUP, HPAService.VERSION);
    }
    return {
        ret: 200,
        msg: 'succ',
        data: data.body
    };
}

HPAService.getHPAByName = async (serverData) => {
    let hap = await CommonService.getObject(HPAService.HPAPLURAL, CommonService.getTServerName(serverData.application + "-" + serverData.serverName), HPAService.GROUP, HPAService.VERSION)
    return {
        ret: 200,
        msg: 'succ',
        data: hap
    };
}

function getMatchLabel(val) {
    let res
    for (let item of hpaConfig) {
        if (item.matchType == "exact") {
            if (item.match.toLowerCase() == val.toLowerCase()) {
                res = item;
                break;
            }
        }
        if (item.matchType == "regex") {
            let reg = new RegExp(item.match)
            if (reg.test(val)) {
                res = item;
                break;
            }
        }
    }
    return res
}

//获取指标名称
HPAService.getHPACustomTarget = async (params) => {
    return new Promise((resolve, reject) => {
        try {
            let request = require('request').defaults({
                ca: require("fs").readFileSync("/var/run/secrets/kubernetes.io/serviceaccount/ca.crt", {
                    encoding: "utf-8"
                }),
            });
            let options = {
                'method': 'GET',
                'url': `https://${process.env.KUBERNETES_SERVICE_HOST}:${process.env.KUBERNETES_SERVICE_PORT}/apis/custom.metrics.k8s.io/v1beta1`,
                'headers': {
                    'Authorization': 'Bearer ' + require("fs").readFileSync("/var/run/secrets/kubernetes.io/serviceaccount/token", {
                        encoding: "utf-8"
                    })
                }
            };
            request(options, function (error, response) {
                if (error) throw new Error(error);
                let data = JSON.parse(response.body);
                let res = []
                data.resources.forEach(item => {
                    if (!item.namespaced) {
                        let nameArr = item.name.split("/");
                        res.push(nameArr[nameArr.length - 1])
                    }
                })
                resolve(res);
            });
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = HPAService;