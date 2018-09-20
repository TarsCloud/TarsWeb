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
const _ = require('lodash');
const moment = require('moment');

const CallChainController = {}

CallChainController.getTraceList = async (ctx) => {
    let {type, content, start_time, end_time} = ctx.paramsObj;
    try {
        let ret;
        start_time = moment(start_time).unix()*1000;
        end_time = moment(end_time).unix()*1000;
        if(type == 'traceId') {
            ret = await AdminService.getTracingResultById(content, start_time, end_time);
        }else {
            ret = await AdminService.getTracingResultByServiceName(content, start_time, end_time);
        }
        let data = JSON.parse('{"spans":{"_proto":{"_bValue":0,"value":[],"_classname":"List<tars.Span>"},"_bValue":0,"value":[{"_bValue":0,"value":[{"traceId":"39501a866547fdaa","id":"7ab1bda102cbb740","parentId":"39501a866547fdaa","name":"test","timestamp":1537279362305,"duration":1572,"status":0,"serviceName":"testapp.tracingjavatwoserver.helloobj","ip":"172.16.2.8","port":"18601","layer":1,"type":"tars","tags":{"_kproto":{"_classname":"string"},"_vproto":{"_classname":"string"},"_bKey":0,"_bValue":0,"value":{},"_classname":"map<string,string>"},"_classname":"tars.Span"},{"traceId":"39501a866547fdaa","id":"a4553942ccdbb2c2","parentId":"39501a866547fdaa","name":"testhello","timestamp":1537279362302,"duration":3581,"status":0,"serviceName":"tars","ip":"0.0.0.0","port":"0","layer":1,"type":"tars","tags":{"_kproto":{"_classname":"string"},"_vproto":{"_classname":"string"},"_bKey":0,"_bValue":0,"value":{},"_classname":"map<string,string>"},"_classname":"tars.Span"},{"traceId":"39501a866547fdaa","id":"39501a866547fdaa","parentId":"","name":"hello","timestamp":1537279362302,"duration":5325,"status":0,"serviceName":"testapp.tracingjavaoneserver.helloobj","ip":"172.16.2.2","port":"18701","layer":0,"type":"tars","tags":{"_kproto":{"_classname":"string"},"_vproto":{"_classname":"string"},"_bKey":0,"_bValue":0,"value":{},"_classname":"map<string,string>"},"_classname":"tars.Span"}],"_classname":"List<tars.Span>"}],"_classname":"List<List<tars.Span>>"},"_classname":"tars.TracingSpanRes"}');
        let newData = [];
        //console.info(data.spans.value);
        for(let i=0;i<data.spans.value.length;i++) {
            let item = data.spans.value[i];
            newData.push(item.value);
        }
        ret.__return = _.flatten(newData);
        ctx.makeResObj(200,'', ret.__return);
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