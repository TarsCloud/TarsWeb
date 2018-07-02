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
const TaskService = require('../../service/task/TaskService');
const util = require('../../tools/util');
const kafkaConf = require('../../../config/webConf').kafkaConf;
const AuthService = require('../../service/auth/AuthService');
let taskQueue;

const TaskController = {
    tempQueue : []
};

if(kafkaConf.enable) {
    const TaskQueue = require('../../service/task/taskQueue');
    taskQueue = new TaskQueue();

    taskQueue.getTaskMessage( message => {
        try{
            logger.info('getTaskMessage:',message);
            let params = JSON.parse(message.value);
            TaskService.addTask(params).then(()=>{
                TaskController.tempQueue.shift();
            });
        }catch(e){
            logger.error('[kafka message]:',message.value);
        }
    });
}



TaskController.getTasks = async (ctx) => {
    try{
        let {application, server_name, command, from, to} = ctx.paramsObj;
        if (!await AuthService.hasDevAuth(application, server_name, ctx.uid)) {
            ctx.makeNotAuthResObj();
        } else {
            let ret = [];
            let tasks = await TaskService.getTasks({application, server_name, command, from, to}).catch(function (e) {
                logger.error('[getTasks]:',e);
                return e;
            });
            for(let i=0,len=tasks.length;i<len;i++) {
                let task = tasks[i];
                try {
                    ret.push(await TaskService.getTaskRsp(task.task_no));
                }catch(e){
                    ret.push({
                        task_no : task.task_no,
                        serial : !!task.serial,
                        status : -1,
                        items : [{}]
                    });
                }
            }
            ctx.makeResObj(200, '', ret);
        }
    }catch(e) {
        logger.error('[TaskController.getTasks]:', e, ctx);
        ctx.makeErrResObj(500, e.toString());
    }
};

TaskController.getTask = async (ctx) => {
    try{
        logger.info('TaskController.tempQueue:',TaskController.tempQueue);
        let ret = {};
        if(TaskController.tempQueue.includes(ctx.paramsObj.task_no)) {
            ret = {
                "task_no": ctx.paramsObj.task_no,               // 任务ID
                "serial": false,              // 是否串行
                "status": 1,                 // 任务状态
                "items":[{
                    "task_no": ctx.paramsObj.task_no,
                    "item_no": "",           // 子任务ID
                    "application": "",       // 应用
                    "server_name": "",       // 服务
                    "node_name": "",         // 节点
                    "command": "",           // 命令
                    "parameters": {},        // 参数
                    "start_time": "",        // 开始时间
                    "end_time": "",          // 结束时间
                    "status": 1,            // 子任务状态
                    "status_info": "",       // 状态信息
                    "execute_info": ""       // 执行信息
                }]
            };
        }else {
            ret = await TaskService.getTaskRsp(ctx.paramsObj.task_no).catch(e=> logger.error('[TaskService.getTaskRsp]:',e));
        }
        ctx.makeResObj(200, '', ret);
    }catch(e) {
        logger.error('[TaskController.getTask]:', e, ctx);
        ctx.makeErrResObj(500, e.toString());
    }
};

TaskController.addTask = async (ctx) => {
    let {serial, items} = ctx.paramsObj;
    if(!items.length) {
        return ctx.makeResObj(500, '#task.params#');
    }
    try {
        let task_no = util.getUUID().toString();
        if(kafkaConf.enable) {
            TaskController.tempQueue.push(task_no);
            await taskQueue.addTask([{messages:JSON.stringify({serial, items, task_no})}]);
        } else {
            await TaskService.addTask({serial, items, task_no});
        }
        ctx.makeResObj(200, '', task_no);
    }catch(e) {
        logger.error('[TaskController.addTask]:', e, ctx);
        ctx.makeErrResObj(500, e.toString());
    }
};

module.exports = TaskController;