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
const PanshiService = require('../../service/panshi/PanshiService');
const ServerService = require('../../service/server/ServerService');
const AuthService = require('../../service/auth/AuthService');
const TaskService = require('../../service/task/TaskService');
const util = require('../../tools/util'); 

const PanshiController = {

};

PanshiController.queryService = async (ctx) => {
    try {
        let data = await PanshiService.queryService();
        ctx.makeResObj(200, '', data);
    } catch (err) {
        logger.error('[queryService]', err, ctx);
        ctx.makeResObj(500, err.message)
    }
};

PanshiController.querySystem = async (ctx) => {
    let ServiceId = ctx.paramsObj.ServiceId;
    try {
        let data = await PanshiService.querySystem({ServiceId});
        ctx.makeResObj(200, '', data);
    } catch (err) {
        logger.error('[querySystem]', err, ctx);
        ctx.makeResObj(500, err.message)
    }
};

PanshiController.queryModule = async (ctx) => {
    let SystemId = ctx.paramsObj.SystemId;
    try {
        let data = await PanshiService.queryModule({SystemId});
        ctx.makeResObj(200, '', data);
    } catch (err) {
        logger.error('[queryModule]', err, ctx);
        ctx.makeResObj(500, err.message)
    }
};

PanshiController.batchUndeployTars = async (ctx) => {
    let {application, server_name, serial=true} = ctx.paramsObj;
    try {
        if (!await AuthService.hasDevAuth(application, server_name, ctx.uid)) {
            ctx.makeNotAuthResObj();
        } else {
            let ret = await ServerService.getServerConfList4Tree({application, serverName:server_name});
            let serverId = ret.map(item => item.id);
            let data = {
                status: 0,  // 0找不到服务，1下线成功，2部分成功，3失败
                total: 0,
                failCount: 0,
                succCount: 0,
                failMsg: '',
                succMsg: ''
            };
            if(!serverId.length){
                ctx.makeResObj(200, '', data);
            }else {
                let task_no = util.getUUID().toString();
                let items = [];
                serverId.forEach(id => {
                    items.push({
                        server_id : id,
                        command : 'undeploy_tars',
                        parameters : ''
                    });
                })
                let ret = await TaskService.addTask({serial, items, task_no});
                console.info(ret);
                ctx.makeResObj(200, '', ret);
            }
        }
    } catch (err) {
        logger.error('[batchUndeployTars]', err, ctx);
        ctx.makeResObj(500, err.message)
    }
}




module.exports = PanshiController;