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
 
const logger = require('../../logger');
const CallChainService = require('../../service/callChain/CallChainService');
const AdminService = require('../../service/admin/AdminService');
const util = require('../../tools/util');
const moment = require('moment');

const CallChainController = {}

CallChainController.getTraceList = async (ctx) => {
    let {id, start_time, end_time} = ctx.paramsObj;
    try {
        let ret = await CallChainService.getTraceList({id, start_time, end_time});
        // let ret = [{
        //     duration:100,
        //     timestamp:1536313740349,
        //     trace_id:"100009384577"
        // }];
        ctx.makeResObj(200,'', util.viewFilter(ret, {trace_id:'', duration:'', timestamp:{formatter:util.formatTimeStamp}}));
    }catch(e) {
        logger.error('[CallChainController.getTraceList]:', e, ctx);
        ctx.makeErrResObj();
    }
}

CallChainController.getTraceDetailList = async (ctx) => {
    let id = ctx.paramsObj.id;
    try{
        let ret = await CallChainService.getTraceDetailList(id);
        //let ret = [{"trace_id":"100009384577","span_id":"1","name":"http://xxx/getUser","status":1,"timestamp":1536313740349,"duration":100,"server_endpoint_ipv4":"10.1.1.1","server_endpoint_service_name":"POC.proxy","type":"HTTP","layer":1,"parent_id":"null"},{"trace_id":"100009384577","span_id":"2","name":"TransObj@trans","status":1,"timestamp":1536313740349,"duration":25,"server_endpoint_ipv4":"10.17.2.2","server_endpoint_service_name":"POC.TransServer","type":"TARS","layer":2,"parent_id":"1"},{"trace_id":"100009384577","span_id":"3","name":"AccesObj@getAcces","status":1,"timestamp":1536313740374,"duration":50,"server_endpoint_ipv4":"10.17.2.3","server_endpoint_service_name":"POC.Acces","type":"TARS","layer":3,"parent_id":"2"},{"trace_id":"100009384577","span_id":"4","name":"Mybatis@getAcces","status":1,"timestamp":1536313740424,"duration":25,"server_endpoint_ipv4":"10.17.2.3","server_endpoint_service_name":"POC.Acces","type":"DB","layer":4,"parent_id":"3"}];
        ctx.makeResObj(200, '', ret);
    }catch(e) {
        logger.error('[CallChainController.getTraceDetailList]:', e, ctx);
        ctx.makeErrResObj();
    }
}

CallChainController.getTopo = async(ctx) => {
    let {serviceName, start, end} = ctx.paramsObj;
    try{
        start = moment(start).unix()*1000;
        end = moment(end).unix()*1000;
        let ret = await AdminService.getTopoGraph(serviceName, start, end);
        ctx.makeResObj(200, '', ret.__return);
    }catch(e) {
        console.info(e);
        logger.error('[CallChainController.getTopo]:', e, ctx);
        ctx.makeErrResObj();
    }
}

module.exports = CallChainController;