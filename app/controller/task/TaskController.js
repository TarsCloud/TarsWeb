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

const moment = require('moment');
const logger = require('../../logger');
const TaskService = require('../../service/task/TaskService');
const util = require('../../tools/util');
// const kafkaConf = require('../../../config/webConf').kafkaConf;
const AuthService = require('../../service/auth/AuthService');
const webConf = require('../../../config/webConf').webConf;
const ServerService = require('../../service/server/ServerService');
const TaskController = {};

// let kafkaProducer;
// let kafkaConsumer;

// if (kafkaConf.enable) {
// 	const kafka = require('kafka-node');
// 	kafkaProducer = require('../../service/task/KafkaProducer');
// 	kafkaConsumer = require('../../service/task/KafkaConsumer');

// 	kafkaConsumer.consume();
// }


TaskController.getTasks = async (ctx) => {
	// console.log(ctx);
	try {
		let {application, server_name, command, from, to, curr_page = 0, page_size = 0} = ctx.paramsObj;
		if (!await AuthService.hasDevAuth(application, server_name, ctx.uid)) {
			ctx.makeNotAuthResObj();
		} else {
			let ret = [];

			let tasks = await TaskService.getTasks({
				application,
				server_name,
				command,
				from,
				to,
				curr_page,
				page_size
			}).catch(function (e) {
				logger.error('[getTasks]:', e);
				return e;
			});

			for (let i = 0, len = tasks.rows.length; i < len; i++) {
				let task = tasks.rows[i];

				try {
					ret.push(await TaskService.getTaskRsp(task.task_no));
				} catch (e) {
					ret.push({
						create_time: task.create_time,
						task_no: task.task_no,
						user_name: task.user_name,
						serial: !!task.serial,
						status: -1,
						items: [{}]
					});
				}

                ret[ret.length - 1].create_time = moment(task.create_time).format("YYYY-MM-DD HH:mm:ss");
			}
			ctx.makeResObj(200, '', {count: tasks.count, rows: ret});
		}
	} catch (e) {
		logger.error('[TaskController.getTasks]:', e, ctx);
		ctx.makeErrResObj(500, e.toString());
	}
};

TaskController.getTask = async (ctx) => {
	try {
		let ret;
		// if (kafkaConf.enable) {
		// 	let task = await TaskService.getTaskStatus(ctx.paramsObj.task_no);
		// 	if (task.status == 'waiting') {
		// 		ret = {status: 0};
		// 	} else {
		// 		ret = await TaskService.getTaskRsp(ctx.paramsObj.task_no);
		// 	}
		// } else {
			ret = await TaskService.getTaskRsp(ctx.paramsObj.task_no);
		// }
		ctx.makeResObj(200, '', ret);
	} catch (e) {
		logger.error('[TaskController.getTask]:', e, ctx);
		ctx.makeErrResObj(500, e.toString());
	}
};

TaskController.checkTask = async(item) => {

	if(item.command == 'undeploy_tars') {
		let server = await ServerService.getServerConfById(item.server_id);
		if(server.application == 'tars') {
			//tars服务, 必须要保留一个, 不能都下线
			let serverList = await ServerService.getServerConfList(server.application, server.server_name);
			if(serverList.length <= 1) {
				return false;
			}

			//部署在框架上的tars公共服务不能下线
			if(await ServerService.isDeployWithRegistry([server.node_name])) {
				return false;
			}
		}
	}

	return true;
}

TaskController.addTask = async (ctx) => {
	let user_name = ctx.uid;
	let {serial, items} = ctx.paramsObj;
	if (!items.length) {
		return ctx.makeResObj(500, '#task.params#');
	}
	try {

		if(webConf.strict) {
			for(var index in items) {
				if(!await TaskController.checkTask(items[index]))
				{
					ctx.makeResObj(500, "#task.serverLimit#");
					return;
				}
			}
		}
		let task_no = util.getUUID().toString();

		for (let i = 0; i < items.length; i++) {
			let item = items[i];

			let server = await ServerService.getServerConfById(item.server_id);

			if (!await AuthService.hasDevAuth(server.application, server.server_name, ctx.uid)) {
				ctx.makeNotAuthResObj();
				return;
			}
		}
	
		// if (kafkaConf.enable) {
		// 	await kafkaProducer.produce(JSON.stringify({serial, items, task_no}), () => {
		// 		logger.info('task produce success!');
		// 	});
		// } else {
			await TaskService.addTask({serial, items, task_no, user_name});
		// }
		ctx.makeResObj(200, '', task_no);
	} catch (e) {
		logger.error('[TaskController.addTask]:', e, ctx);
		ctx.makeErrResObj(500, e.toString());
	}
};

TaskController.delTask = async (ctx) => {
	let {task_no} = ctx.paramsObj;

	try 
	{
		if (!await AuthService.hasAdminAuth(ctx.uid)) {
			ctx.makeNotAuthResObj();
		} else {	
			await TaskService.delTask(task_no);

			ctx.makeResObj(200, '', task_no);
		}
	} catch (e) {
		logger.error('[TaskController.delTask]:', e, ctx);
		ctx.makeErrResObj(500, e.toString());
	}
};

module.exports = TaskController;