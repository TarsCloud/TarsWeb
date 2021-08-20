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
 
/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('t_task_item', {
		id: {
			type: DataTypes.INTEGER(11).UNSIGNED,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		task_no: {
			type: DataTypes.STRING(40),
			allowNull: true
		},
		item_no: {
			type: DataTypes.STRING(40),
			allowNull: true
		},
		application: {
			type: DataTypes.STRING(30),
			allowNull: true
		},
		server_name: {
			type: DataTypes.STRING(50),
			allowNull: true
		},
		node_name: {
			type: DataTypes.STRING(20),
			allowNull: true
		},
		command: {
			type: DataTypes.STRING(20),
			allowNull: true
		},
		parameters: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		start_time: {
			type: DataTypes.DATE,
			allowNull: true
		},
		end_time: {
			type: DataTypes.DATE,
			allowNull: true
		},
		status: {
			type: DataTypes.INTEGER(11),
			allowNull: true
		},
		set_name: {
			type: DataTypes.STRING(20),
			allowNull: true
		},
		log: {
			type: DataTypes.TEXT,
			allowNull: true
		}
	}, {
		tableName: 't_task_item',
		timestamps: false,
		indexes: [{
				name: 'f_uniq',
				unique: true,
				fields: ['item_no', 'task_no']
			},
			{
				name: 'f_task_no',
				unique: false,
				fields: ['task_no']
			},
			{
				name: 'f_index',
				unique: false,
				fields: [`application`,`server_name`,`command`]
			}
		]
	});
};
