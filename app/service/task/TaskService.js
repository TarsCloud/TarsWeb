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

const logger = require('../../../logger');
const AdminService = require('../../service/admin/AdminService');
const ServerService = require('../../service/server/ServerService');
const ConfigService = require('../../service/config/ConfigService');
const util = require('../../../tools/util');
const TaskDao = require('../../dao/TaskDao');
// const KafkaDao = require('../../dao/KafkaDao');
const AuthService = require('../../service/auth/AuthService');
const TreeService = require('../../service/server/TreeService');

const TaskService = {};


TaskService.getTaskRsp = async(taskNo) => {
    let rsp = await AdminService.getTaskRsp(taskNo);
    logger.info('getTaskRsp:', rsp);
    return {
        task_no: rsp.taskNo,
        serial: rsp.serial,
        status: rsp.status,
        create_time: rsp.createTime,
        userName: rsp.userName,
        items: rsp.taskItemRsp.map(item => {
            return {
                task_no: item.req.taskNo,
                item_no: item.req.itemNo,
                application: item.req.application,
                server_name: item.req.serverName,
                node_name: item.req.nodeName,
                command: item.req.command,
                parameters: item.parameters,
                start_time: item.startTime,
                end_time: item.endTime,
                status: item.status,
                status_info: item.statusInfo,
                execute_info: item.executeLog,
                percent: item.percent
            }
        })
    };
};

TaskService.delTask = async(task_no) => {
    return await TaskDao.delTask(task_no);
};

TaskService.getTasks = async(params) => {
    return await TaskDao.getTask(params);
};

// TaskService.getTaskStatus = async (taskNo) => {
// 	return await KafkaDao.getTaskByTaskNo(taskNo);
// };

TaskService.addTask = async(params, ticket) => {
    let items = [];
    let userName = params.user_name || '';
    for (let i = 0, len = params.items.length; i < len; i++) {
        let item = params.items[i];
        let parameters = item.parameters;
        if (Object.prototype.toString.call(parameters) == '[object Object]' && parameters.bak_flag != undefined) {
            parameters.bak_flag = (1 & parameters.bak_flag).toString();
        }
        let obj = {
            taskNo: params.task_no,
            itemNo: util.getUUID(),
            command: item.command,
            parameters: parameters,
            userName: userName,
        };
        let serverConf = await ServerService.getServerConfById(item.server_id.toString()).catch(e => {
            logger.error('[ServerService.getServerConfById]:', e.toString());
            return Promise.reject(e.toString());
        });

        Object.assign(obj, {
            application: serverConf.application,
            serverName: serverConf.server_name,
            nodeName: serverConf.node_name
        });
        items.push(obj);
        logger.info('[TaskService.addTask items]:', obj);

        if (item.command === 'undeploy_tars') {
            TaskService.autoDeletePermission(serverConf.application, serverConf.server_name, params.task_no);
            TreeService.setCacheData()
            // 删除服务的配置文件
            // 如果是下线服务，那么需要删除删除t_config_files的数据
			let server_name = serverConf.application + "." + serverConf.server_name;
			let host = serverConf.node_name;
			let set_name = serverConf.set_name || '';
			let set_area = serverConf.set_area || '';
			let set_group = serverConf.set_group || '';
			let set_info = set_name+"."+set_area+"."+set_group;
			let del_config_file_ret = await ConfigService.deleteConfigByServerNameAndHost(server_name,host,set_name,set_area,set_group);
			logger.info("deleteConfigByServerNameAndHost server_name: ", server_name, ",host: ", host, "set: ", set_info ,",ret: ", del_config_file_ret);
			// 删除之后，判断是否还有其他节点的配置信息，如果没有，说明没有其他节点了，那么要把server级别的配置文件删除（level=2）
			await ConfigService.deleteSvrConfWhenNoNodeConf(server_name,set_name,set_area,set_group);
        }
    }
    let req = {
        taskNo: params.task_no,
        taskItemReq: items,
        serial: params.serial,
        create_time: new Date(),
        userName: userName,
        isElegant: params.elegant,
        eachNum: params.eachnum
    };

    logger.info("addTask, isElegant:", req.isElegant, ", taskNo:", req.taskNo);

    try {
        await AdminService.addTask(req);

    } catch (e) {
        // await OperateLogService.TaskLog(req, 500)
        throw new Error("[AdminService] add Task failed");
    }
    return params.task_no;
};

TaskService.autoDeletePermission = function(application, server_name, taskNo) {
    let t = null,
        timeout = 60 * 1000, // 60S 超时
        start = new Date().getTime();
    let f = function() {
        if (new Date().getTime() - start >= timeout) {
            clearTimeout(t);
            t = null;
            logger.error('unDeployPermission err: timeout');
            return;
        }
        TaskService.getTaskRsp(taskNo).then(function(data) {
            if (data.status == 2) {
                AuthService.deleteAuth(application, server_name);
                clearTimeout(t);
                t = null;
                return;
            }
            t = setTimeout(f, 3000);
        }).catch(function(err) {
            t = setTimeout(f, 3000);
        });
    };
    f();
};

module.exports = TaskService;