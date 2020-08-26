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

const client  = require("@tars/rpc/protal.js").client;
const AdminRegProxy = require("./rpcProxy/AdminRegProxy");
const ConfigFProxy = require("./rpcProxy/ConfigFProxy");
const DCacheOptProxy = require("./rpcProxy/DCacheOptProxy");
const MonitorQueryProxy = require("./rpcProxy/MonitorQueryProxy");
const BenchmarkAdminProxy = require("./rpcProxy/BenchmarkAdminProxy");
const BenchmarkNode = require("./rpcProxy/BenchmarkNodeTars");
const path = require('path');
const logger = require('./../../../logger');
client.initialize(path.join(__dirname, '../../../../config/tars.conf'));
const RPCClientPrx = (proxy, moduleName, interfaceName, servantName, setInfo) => {
    var module = proxy[moduleName];
    var rpcClient = client.stringToProxy(module[interfaceName+'Proxy'], servantName, setInfo);
    for(let p in rpcClient){
        if(!rpcClient.hasOwnProperty(p) && p!='getTimeout' && p!='setTimeout'){
            ((p, fun) => {
                rpcClient[p] = (function(p) {
                    let fnName = p;
                    return async function(...args){
                        try{
                            var _args = args;
                            var rst = await (async ()=>{
                                var result = await fun.apply(rpcClient, _args);
                                // logger.info( 'method: ',fnName, ' request: ', _args, ' response: ', JSON.stringify(result.response));
                                var args = result.response.arguments;
                                var rst = {__return: result.response.return};
                                for(var p in args){
                                    if(typeof args[p] == 'object'){
                                        rst[p] = args[p].toObject();
                                    }else{
                                        rst[p] = args[p];
                                    }
                                }

                                // logger.info( 'method: ',fnName, ' request: ', _args, ' response: ', rst);
                                return rst;
                            })();
                            return rst;
                        }catch(e){
                            console.error(e);
                            if(e.response){
                                throw new Error(e.response && e.response.error && e.response.error.message);
                            }else{
                                throw(e);
                            }
                        }
                    };
                })(p);
            })(p, rpcClient[p]);

        }
    }
    return rpcClient;
};

//生成rpc结构体
const RPCStruct = function(proxy, moduleName){
    var module = proxy[moduleName];
    var rpcStruct = {};
    for(var p in module){
        if(module.hasOwnProperty(p)){
            if(typeof module[p] == 'function'){
                if(new module[p]()._classname){
                    rpcStruct[p] = module[p];
                }
            }else{
                rpcStruct[p] = module[p];
            }
        }
    }
    return rpcStruct;
};

//输出TARS RPC代理和组件
module.exports = {

    adminRegPrx : RPCClientPrx(AdminRegProxy, 'tars', 'AdminReg', 'tars.tarsAdminRegistry.AdminRegObj'),
    adminRegStruct : RPCStruct(AdminRegProxy, 'tars'),

    configFPrx : RPCClientPrx(ConfigFProxy, 'tars', 'Config', 'tars.tarsconfig.ConfigObj'),
    configFStruct : RPCStruct(ConfigFProxy, 'tars'),

    statQueryPrx : RPCClientPrx(MonitorQueryProxy, 'tars', 'MonitorQuery', 'tars.tarsquerystat.QueryObj'),
    propertyQueryPrx : RPCClientPrx(MonitorQueryProxy, 'tars', 'MonitorQuery', 'tars.tarsqueryproperty.QueryObj'),
    monitorQueryStruct : RPCStruct(MonitorQueryProxy, 'tars'),

    DCacheOptPrx: RPCClientPrx(DCacheOptProxy, 'DCache', 'DCacheOpt', 'DCache.DCacheOptServer.DCacheOptObj'),
    DCacheOptStruct: RPCStruct(DCacheOptProxy, 'DCache'),

    // nodePrx: RPCClientPrx(NodeProxy, 'tars', 'Node', 'tars.tarsnode.NodeObj'),
    // nodeStruct: RPCStruct(NodeProxy, 'tars'),
    benchmarkPrx : RPCClientPrx(BenchmarkAdminProxy, 'bm', 'Admin', 'benchmark.AdminServer.AdminObj'),
    benchmarkStruct : RPCStruct(BenchmarkAdminProxy, 'bm'),
    benchmarkNodeStruct : RPCStruct(BenchmarkNode, 'bm'),

    client: client
};
