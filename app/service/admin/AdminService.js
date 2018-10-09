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
 
const {configFPrx, configFStruct, adminRegPrx, adminRegStruct, queryTracingPrx, queryTracingStruct, authPrx, authStruct, client} = require('../util/rpcClient');
var registry  = require("@tars/registry");
const TarsStream = require('@tars/stream');
const _ = require('lodash')

registry.setLocator(client.getProperty('locator'));

const logger = require('../../logger');


const AdminService = {};

AdminService.loadServer = async (application, server, nodeName) => {
    let ret = await adminRegPrx.loadServer(application, server, nodeName);
    if(ret.__return === 0){
        return ret.result;
    }else{
        throw new Error(__return);
    }
};

AdminService.loadConfigByHost = async (server, filename, host) => {
    let ret = await configFPrx.loadConfigByHost(server, filename, host);
    if(ret.__return === 0) {
        return ret.config;
    }else{
        throw new Error(ret.__return);
    }
};

AdminService.doCommand = async (targets, command) => {
    let rets = [];
    for(var i=0,len=targets.length;i<len;i++) {
        let target = targets[i];
        let ret = {};
        try {
            ret = await adminRegPrx.notifyServer(target.application, target.serverName, target.nodeName, command);
        }catch(e) {
            ret = {
                __return : -1,
                result : e
            }
        }

        rets.push({
            application : target.application,
            server_name : target.serverName,
            node_name : target.nodeName,
            ret_code : ret.__return,
            err_msg : ret.result
        });
    }
    return rets;
};

AdminService.getTaskRsp = async (taskNo) => {
    let ret = await adminRegPrx.getTaskRsp(taskNo);
    if(ret.__return == 0 ){
        return ret.taskRsp;
    }else {
        return ret.__return;
    }
};

AdminService.addTask = async (req) => {
    logger.info('addTask req:',req);
    let taskReq = new adminRegStruct.TaskReq();
    taskReq.taskNo = req.taskNo;
    taskReq.serial = req.serial;
    taskReq.userName = req.userName;
    req.taskItemReq.forEach((obj)=>{
        let taskItemReq = new adminRegStruct.TaskItemReq();
        taskItemReq.taskNo = obj.taskNo || '';
        taskItemReq.itemNo = obj.itemNo || '';
        taskItemReq.application = obj.application || '';
        taskItemReq.serverName = obj.serverName || '';
        taskItemReq.nodeName = obj.nodeName || '';
        taskItemReq.setName = obj.setName || '';
        taskItemReq.command = obj.command || '';
        taskItemReq.userName = obj.userName || '';
        taskItemReq.parameters = new TarsStream.Map(TarsStream.String, TarsStream.String);
        _.each(obj.parameters, (value, key)=>{
            taskItemReq.parameters.put(String(key), String(value))
        });
        taskReq.taskItemReq.push(taskItemReq)
    });
    let ret = await adminRegPrx.addTaskReq(taskReq);

    return ret.__return;
};


AdminService.getEndpoints = async (objName) => {
    let ret = await registry.findObjectById(objName);
    return ret.response.return.value;
};

AdminService.getTopoGraph = async (serviceName, start, end, set_div) => {
    let tracingAnalysisReq = new queryTracingStruct.TracingAnalysisReq();
    tracingAnalysisReq.readFromObject({
        serviceName,
        start,
        end,
        set_div
    });
    return queryTracingPrx.getQueryChainResult(tracingAnalysisReq);
}

AdminService.getTracingResultById = async (traceId, start, end) => {
    let tracingSpanReq = new queryTracingStruct.TracingSpanReq();
    tracingSpanReq.readFromObject({start, end, traceId});
    return await queryTracingPrx.getQueryTracingResult(tracingSpanReq);
}

AdminService.getTracingResultByServiceName = async (serviceName, start, end) => {
    let tracingSpanReq = new queryTracingStruct.TracingSpanReq();
    tracingSpanReq.readFromObject({start, end, serviceName});
    return await queryTracingPrx.getQueryTracingResult(tracingSpanReq);
}

AdminService.getTokens = async(objs) => {
    let tokenReq = new authStruct.TokenRequest();
    logger.info(objs);
    tokenReq.readFromObject({vObjName:objs})
    return await authPrx.getTokens(tokenReq);
}

AdminService.applyToken = async (application, serverName, calledObjName) => {
    let applyTokenReq = new authStruct.ApplyTokenRequest();
    let param = {
        sApplication: application,
        sServer: serverName,
        sObjName: calledObjName
    };
    applyTokenReq.readFromObject({
        sKey: param
    });
    return await authPrx.applyToken(applyTokenReq);
}

AdminService.deleteToken = async (application, serverName, calledObjName) => {
    let deleteTokenReq = new authStruct.DeleteTokenRequest();
    deleteTokenReq.readFromObject({
        sKey: {
            sApplication: application,
            sServer: serverName,
            sObjName: calledObjName
        }
    });
    return await authPrx.deleteToken(deleteTokenReq);
}

AdminService.authProcess = async (application, server_name, token) => {
    let authReq = new authStruct.AuthRequest();
    authReq.readFromObject(application, server_name, token);
}

module.exports = AdminService;