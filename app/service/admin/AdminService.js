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

const { configFPrx, configFStruct, adminRegPrx, adminRegStruct, client } = require('../util/rpcClient');
const registry = require("@tars/registry");
const TarsStream = require('@tars/stream');
const crypto = require("crypto")
const _ = require('lodash')

registry.setLocator(client.getProperty('locator'));

const logger = require('../../logger');

//hash number计算(不直接用taskNo前几位，不耦合)
function getHashNumber(taskNo){
    let buf = crypto.createHash("md5").update(taskNo +"").digest();
    return ((buf[3] << 24) | (buf[2] << 16) | (buf[1] << 8) | buf[0]) >>> 0
}

const AdminService = {};

AdminService.undeploy = async(application, server, nodeName, user, info) => {
    let ret = await adminRegPrx.undeploy(application, server, nodeName, user, info);
    if (ret.__return === 0) {
        return ret.result;
    } else {
        throw new Error(ret.__return);
    }
};

AdminService.pingNode = async(nodeName) => {
    
    let timeout = adminRegPrx.getTimeout();
    adminRegPrx.setTimeout(2000);
    let ret = await adminRegPrx.pingNode(nodeName);
    adminRegPrx.setTimeout(timeout);

    if (ret.__return) {
        return ret.result;
    } else {
        return false;
        // throw new Error(ret.__return);
    }
};

AdminService.loadServer = async(application, server, nodeName) => {
    let ret = await adminRegPrx.loadServer(application, server, nodeName);
    if (ret.__return === 0) {
        return ret.result;
    } else {
        throw new Error(ret.__return);
    }
};

AdminService.loadConfigByHost = async(server, filename, host) => {
    let ret = await configFPrx.loadConfigByHost(server, filename, host);
    if (ret.__return === 0) {
        return ret.config;
    } else {
        throw new Error(ret.__return);
    }
};

AdminService.doCommand = async(targets, command) => {
    let rets = [];
    for (var i = 0, len = targets.length; i < len; i++) {
        let target = targets[i];
        let ret = {};
        try {
            ret = await adminRegPrx.notifyServer(target.application, target.serverName, target.nodeName, command);
        } catch (e) {
            ret = {
                __return: -1,
                result: e
            }
        }

        rets.push({
            application: target.application,
            server_name: target.serverName,
            node_name: target.nodeName,
            ret_code: ret.__return,
            err_msg: ret.result
        });
    }
    return rets;
};

AdminService.getTaskRsp = async(taskNo) => {
    let ret = await adminRegPrx.getTaskRsp(taskNo,{
        hashCode: getHashNumber(taskNo)
    });
    if (ret.__return == 0) {
        return ret.taskRsp;
    } else {
        return ret.__return;
    }
};

AdminService.addTask = async(req) => {
    logger.info('addTask req:', req);
    let taskReq = new adminRegStruct.TaskReq();
    taskReq.taskNo = req.taskNo;
    taskReq.serial = req.serial;
    taskReq.userName = req.userName;
    req.taskItemReq.forEach((obj) => {
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
        _.each(obj.parameters, (value, key) => {
            taskItemReq.parameters.put(String(key), String(value))
        });
        taskReq.taskItemReq.push(taskItemReq)
    });
    let ret = await adminRegPrx.addTaskReq(taskReq,{
        hashCode: getHashNumber(taskReq.taskNo)
    });

    return ret.__return;
};


AdminService.getEndpoints = async(objName) => {
    let ret = await registry.findObjectById(objName);
    return ret.response.return.value;
};

AdminService.getLogFileList = async(application, server, nodeName) => {
    let ret = await adminRegPrx.getLogFileList(application, server, nodeName);
    if (ret.__return === 0) {
        return ret.logFileList;
    } else {
        throw new Error(ret.__return);
    }
};

AdminService.getLogData = async(application, server, nodeName, logFile, cmd) => {
    let ret = await adminRegPrx.getLogData(application, server, nodeName, logFile, cmd);
    if (ret.__return === 0) {
        return ret.fileData;
    } else {
        throw new Error(ret.__return);
    }
};

AdminService.deletePatchFile = async(application, server, patchFile) => {
    await adminRegPrx.deletePatchFile(application, server, patchFile);
    return 0;
};

AdminService.getFrameworkList = async() => {
 
    let timeout = adminRegPrx.getTimeout();

    adminRegPrx.setTimeout(3000);

    let ret = await adminRegPrx.getServers();

    adminRegPrx.setTimeout(timeout);

    if (ret.__return === 0) {
        return ret.servers;
    } else {
        // console.log("getFrameworkList", ret);
        throw new Error(__return);
    }
};

AdminService.checkServer = async(server) => {

    let s = new adminRegStruct.FrameworkServer();
    s.readFromObject(server);

    let ret = await adminRegPrx.checkServer(s);

    if (ret.__return === 0) {
        return 0;
    } else {
        throw new Error(__return);
    }
};

AdminService.getProfileTemplate = async(profileName) => {

    let ret = await adminRegPrx.getProfileTemplate(profileName);

    if (ret.__return === 0) {
        return ret.profileTemplate;
    } else {
        throw new Error(__return);
    }
};

AdminService.getVersion = async () => {
    let ret = await adminRegPrx.getVersion();
    if (ret.__return === 0) {
        return ret.version;
    } else {
        throw new Error(ret.__return);
    }
};

module.exports = AdminService;