/**
 * Created by clauseliu on 2018/5/7.
 */

const logger = require('../../logger');
const TaskService = require('../../service/task/TaskService');
const util = require('../../tools/util');
const kafkaConf = require('../../../config/webConf').kafkaConf;

let taskQueue;
if(kafkaConf.enable) {
    const TaskQueue = require('../../service/task/taskQueue');
    taskQueue = new TaskQueue();
}



const TaskController = {};

TaskController.getTasks = async (ctx) => {
    let {application, server_name, command, from, to} = ctx.paramsObj;
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
};

TaskController.getTask = async (ctx) => {
    try{
        return await TaskService.getTaskRsp(ctx.paramsObj.task_no);
    }catch(e) {
        logger.error(e);
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
            await taskQueue.addTask([{messages:JSON.stringify({serial, items, task_no})}]);
        } else {
            await TaskService.addTask({serial, items, task_no});
        }
        let ret = await TaskService.getTaskRsp(task_no);
        ctx.makeResObj(200, '', ret);
    }catch(e) {
        logger.error(e);
        ctx.makeErrResObj(500, e.toString());
    }
};

module.exports = TaskController;