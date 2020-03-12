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

const {tTask, tTaskItem} = require('./db').db_tars;
const Sequelize = require('sequelize');
const moment = require('moment');
const Op = Sequelize.Op;

tTask.belongsTo(tTaskItem, {foreignKey: 'task_no', as: 'taskItem', targetKey: 'task_no'});

module.exports = {
	delTask: async (task_no) => {
		await tTask.destroy({
			where: {task_no: task_no}
		});

		await tTaskItem.destroy({
			where: {task_no: task_no}
		})
	},
	getTask: async (params) => {
		let whereObj = {};
		params.application && Object.assign(whereObj, {'$taskItem.application$': params.application});
		params.server_name && Object.assign(whereObj, {'$taskItem.server_name$': params.server_name});
		params.command && Object.assign(whereObj, {'$taskItem.command$': params.command});
		if (params.from) {
			whereObj.create_time = {
				[Op.gte] : params.from
				// ['$gte'] = params.from
			};
		}
		if (params.to) {
			whereObj.create_time = {
				[Op.lte] : moment(params.to + " 23:59:59", "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:mm:ss")
			};
			// whereObj.create_time['$lte'] = params.to
		}
		let opts = {
			attribute: ['task_no', 'serial', 'create_time', 'user_name'],
			order: [['create_time', 'desc']],
			where: whereObj,
			include: {
				model: tTaskItem,
				as: 'taskItem'
			},
		}
		if (params.curr_page && params.page_size) {
			Object.assign(opts, {
				limit: parseInt(params.page_size),
				offset: parseInt(params.page_size) * (parseInt(params.curr_page) - 1)
			})
		}

		return tTask.findAndCountAll(opts);
	}
};
