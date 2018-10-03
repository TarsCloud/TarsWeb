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
        if(data.result == 0){
            ctx.makeResObj(200, '', data.data);
        }else{
            logger.error('[queryService]', (data.result_msg || data.result_info));
            ctx.makeResObj(500, (data.result_msg || data.result_info));
        }
    } catch (err) {
        logger.error('[queryService]', err, ctx);
        ctx.makeResObj(500, err.message)
    }
};

PanshiController.querySystem = async (ctx) => {
    let ServiceId = ctx.paramsObj.ServiceId;
    try {
        let data = await PanshiService.querySystem({ServiceId});
        if(data.result == 0){
            ctx.makeResObj(200, '', data.data);
        }else{
            logger.error('[querySystem]', (data.result_msg || data.result_info));
            ctx.makeResObj(500, (data.result_msg || data.result_info));
        }
    } catch (err) {
        logger.error('[querySystem]', err, ctx);
        ctx.makeResObj(500, err.message)
    }
};

PanshiController.queryModule = async (ctx) => {
    let SystemId = ctx.paramsObj.SystemId;
    try {
        let data = await PanshiService.queryModule({SystemId});
        if(data.result == 0){
            ctx.makeResObj(200, '', data.data);
        }else{
            logger.error('[queryModule]', (data.result_msg || data.result_info));
            ctx.makeResObj(500, (data.result_msg || data.result_info));
        }
    } catch (err) {
        logger.error('[queryModule]', err, ctx);
        ctx.makeResObj(500, err.message)
    }
};

/**
 * 下线指定服务的所有节点
 * @param {Object} ctx
 * @returns {Object} {status:Number, msg:String|Object} 0没有服务,2成功,3失败,4取消,5部分成功 
 */
PanshiController.batchUndeployTars = async (ctx) => {
    let {application, server_name, serial=true} = ctx.paramsObj;
    try {
        if (!await AuthService.hasDevAuth(application, server_name, ctx.uid)) {
            ctx.makeNotAuthResObj();
        } else {
            let ret = await ServerService.getServerConfList4Tree({application, serverName:server_name});
            ret = ret.map(item => {
                return {
                    id : item.id,
                    currState : item.present_state,
                    settingState : item.setting_state
                }
            });
            if(!ret.length){
                ctx.makeResObj(200, '', {status:0, msg: 'no server'});
            }else {
                // 如果有节点存活则不允许下线服务
                let activeNode = ret.filter(item => item.currState == 'active');
                if(activeNode.length) {
                    ctx.makeResObj(200, '', {status:3, msg: 'some nodes are active,please stop them first'});
                    return;
                }

                let serverId = ret.map(item => item.id);
                let task_no = util.getUUID().toString();
                let items = [];
                serverId.forEach(id => {
                    items.push({
                        server_id : id,
                        command : 'undeploy_tars',
                        parameters : ''
                    });
                });
                let taskNo = await TaskService.addTask({serial, items, task_no});
                let rsp = await getTaskRsp(taskNo);
                if(rsp.status == 3 && rsp.msg) {
                    ctx.makeResObj(200, '', rsp);
                }else {
                    ctx.makeResObj(200, '', {status: rsp.status, msg: rsp});
                }
            }
        }
    } catch (err) {
        logger.error('[batchUndeployTars]', err, ctx);
        ctx.makeResObj(500, err.message)
    }
}

PanshiController.syncUndeployInfo = async (ctx) => {
    let {server_name} = ctx.paramsObj;
    try {
        let data = await PanshiService.syncUndeployInfo(server_name);
        if(data.result == 0){
            ctx.makeResObj(200, '', data.result_info);
        }else{
            logger.error('[syncUndeployInfo]', data.result_info);
            ctx.makeResObj(500, data.result_info);
        }
    } catch (err) {
        logger.error('[syncUndeployInfo]', err, ctx);
        ctx.makeResObj(500, err.message)
    }
}

function getTaskRsp (task_no) {
    let t = null,
        timeout = 60 * 1000,   // 60S 超时
        start = new Date().getTime();
    return new Promise((resolve, reject) =>{
        let f = function () {
            if(new Date().getTime() - start >= timeout) {
                clearTimeout(t);
                t = null;
                logger.error('PanshiController.getTaskRsp err: timeout');
                reject({status:3, msg:'timeout'});
            }
            TaskService.getTaskRsp(task_no).then(data=> {
                if(data.status!=0 && data.status!=1){
                    clearTimeout(t);
                    t = null;
                    resolve(data);
                    return;
                }
                t = setTimeout(f, 3000);
            }).catch(function (err) {
                logger.error('PanshiController.getTaskRsp err:',err);
                clearTimeout(t);
                t = null;
                reject({status:3, msg: err});
            });
        };
        f();
    });
}


module.exports = PanshiController;