/**
 * Created by clauseliu on 2018/5/7.
 */

const logger = require('../../logger');
const AdminService = require('../../service/admin/AdminService');
const ServerService = require('../../service/server/ServerService');
const util = require('../../tools/util');
const TaskDao = require('../../dao/TaskDao');
const kafkaConf = require('../../../config/webConf').kafkaConf;

const TaskService = {};

if(kafkaConf.enable) {
    const TaskQueue = require('../../service/task/taskQueue');
    const taskQueue = new TaskQueue();


    taskQueue.getTaskMessage( message => {
        let params = JSON.parse(message.value);
        TaskService.addTask(params);
    }, err => {
        logger.error('[kafka error]:',err);
        return err;
    });
}


TaskService.getTaskRsp = async (taskNo) => {
    let rsp = await AdminService.getTaskRsp(taskNo).catch(e => logger.error('[adminService.getTaskRsp]:',e));
    return {
        task_no : rsp.taskNo,
        serial : rsp.serial,
        status : rsp.status,
        items : rsp.taskItemRsp.map(item => {
            return {
                task_no : item.req.taskNo,
                item_no : item.req.itemNo,
                application : item.req.application,
                server_name : item.req.serverName,
                node_name : item.req.nodeName,
                command : item.req.command,
                parameters : item.parameters,
                start_time : item.startTime,
                end_time : item.endTime,
                status : item.status,
                status_info : item.statusInfo,
                execute_info : item.executeLog
            }
        })
    };
};


TaskService.getTasks = async (params) => {
    return await TaskDao.getTask(params);
};

TaskService.addTask = async (params) => {
    let items = [];
    for(let i=0,len=params.items.length;i<len;i++) {
        let item = params.items[i];
        let parameters = item.parameters;
        if(Object.prototype.toString.call(parameters)=='[object Object]' && parameters.bak_flag!=undefined){
            parameters.bak_flag = 1 & parameters.bak_flag;
        }
        let obj = {
            taskNo : params.task_no,
            itemNo : util.getUUID(),
            command : item.command,
            parameters : JSON.stringify(parameters)
        };
        let serverConf = await ServerService.getServerConfById(item.server_id).catch(e => {
            console.error('[ServerService.getServerConfById]:',e.toString());
            return Promise.reject(e.toString());
        });

        Object.assign(obj,{
            application : serverConf.application,
            serverName : serverConf.server_name,
            nodeName : serverConf.node_name
        });
        items.push(obj);
        logger.info('[TaskService.addTask items]:',obj);
    }
    let req = {
        taskNo : params.task_no,
        taskItemReq : items,
        serial : params.serial,
        userName : params.user_name || ''
    };
    await AdminService.addTask(req).catch(e => {console.error('[AdminService.addTask]:',e)});
    return params.task_no;
};

module.exports = TaskService;