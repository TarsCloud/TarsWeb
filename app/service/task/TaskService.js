/**
 * Created by clauseliu on 2018/5/7.
 */

const logger = require('../../logger');
const AdminService = require('../../service/admin/AdminService');
const ServerService = require('../../service/server/ServerService');
const util = require('../../controller/util/util');
const TaskDao = require('../../dao/TaskDao');



const TaskService = {};

TaskService.getTaskRsp = async (taskNo) => {
    let rsp = await AdminService.getTaskRsp(taskNo).catch(function (e) {
        logger.error('[adminService.getTaskRsp]:',e);
    });
    return {
        task_no : rsp.task_no,
        serial : rsp.serial,
        status : rsp.status,
        items : rsp.taskItem.map(item => {
            return {
                task_no : item.task_no,
                item_no : item.item_no,
                application : item.application,
                server_name : item.server_name,
                node_name : item.node_name,
                command : item.command,
                parameters : item.parameters,
                start_time : item.start_time,
                end_time : item.end_time,
                status : item.status,
                status_info : item.status_info,
                execute_info : item.execute_info
            }
        })
    };
};


TaskService.getTasks = async (params) => {
    return await TaskDao.getTask(params);
};

TaskService.addTask = async (params) => {
    let uuid = util.getUUID();
    let items = [];
    for(let i=0,len=params.items.length;i<len;i++) {
        let item = params.items[i];
        let parameters = item.parameters;
        if(Object.prototype.toString.call(parameters)=='[object Object]' && parameters.bak_flag!=undefined){
            parameters.bak_flag = 1 & parameters.bak_flag;
        }
        let obj = {
            task_no : uuid,
            item_no : util.getUUID(),
            command : item.command,
            parameters : parameters
        };
        let serverConf = await ServerService.getServerConfById(item.server_id).catch(e => {
            console.error('[ServerService.getServerConfById]:',e.toString());
            return Promise.reject(e.toString());
        });

        Object.assign(obj,{
            application : serverConf.application,
            server_name : serverConf.server_name,
            node_name : serverConf.host
        });
        items.push(obj);
    }
    let req = {
        task_no : uuid,
        items : items
    };
    await AdminService.addTask(req).catch(e => {
        console.error('[AdminService.addTask]:',e.toString());
        return Promise.reject(e.toString());
    });
    return uuid
};

module.exports = TaskService;