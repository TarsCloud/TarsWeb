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
    RPCClientPrx
} = require('./service');

const client = require("@tars/rpc/protal.js").Communicator.New();
const MonitorQueryProxy = require("./proxy/MonitorQueryProxy");
const TopologyProxy = require("./topology/TopologyProxy");
const EndpointManager = require("./proxy/getservant/lib/getEndpoint");
const WebConf = require('../config/webConf');

client.initialize(WebConf.k8s.client);

//生成rpc结构体
const RPCStruct = function (proxy, moduleName) {
    var module = proxy[moduleName];
    var rpcStruct = {};
    for (var p in module) {
        if (module.hasOwnProperty(p)) {
            if (typeof module[p] == 'function') {
                if (new module[p]()._classname) {
                    rpcStruct[p] = module[p];
                }
            } else {
                rpcStruct[p] = module[p];
            }
        }
    }
    return rpcStruct;
};

let TARS_K8S_PROXY = "";

let registry;

if (process.env.NODE_ENV == "all" && process.env.TARS_K8S_PROXY) {
    TARS_K8S_PROXY = process.env.TARS_K8S_PROXY;
    registry = new EndpointManager("tars.tarsregistry.QueryObj" + TARS_K8S_PROXY).getQueryPrx();
} else {
    registry = new EndpointManager(client.getProperty('locator')).getQueryPrx();
}

module.exports = {

    statQueryPrx: RPCClientPrx(client, MonitorQueryProxy, 'tars', 'MonitorQuery', 'tars.tarsquerystat.QueryObj' + TARS_K8S_PROXY),
    propertyQueryPrx: RPCClientPrx(client, MonitorQueryProxy, 'tars', 'MonitorQuery', 'tars.tarsqueryproperty.QueryObj' + TARS_K8S_PROXY),

    topologyPrx: RPCClientPrx(client, TopologyProxy, 'tars', 'Topology', 'tars.tarslog.TopologyObj' + TARS_K8S_PROXY),

    client: client,

    registry: registry
};