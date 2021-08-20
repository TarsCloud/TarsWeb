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
	return sequelize.define('t_server_notifys', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		application: {
			type: DataTypes.STRING(128),
			allowNull: true,
			defaultValue: ''
		},
		server_name: {
			type: DataTypes.STRING(128),
			allowNull: true
		},
		container_name: {
			type: DataTypes.STRING(128),
			allowNull: true,
			defaultValue: ''
		},
		node_name: {
			type: DataTypes.STRING(128),
			allowNull: false,
			defaultValue: ''
		},
		set_name: {
			type: DataTypes.STRING(16),
			allowNull: true
		},
		set_area: {
			type: DataTypes.STRING(16),
			allowNull: true
		},
		set_group: {
			type: DataTypes.STRING(16),
			allowNull: true
		},
		server_id: {
			type: DataTypes.STRING(100),
			allowNull: true
		},
		thread_id: {
			type: DataTypes.STRING(20),
			allowNull: true
		},
		command: {
			type: DataTypes.STRING(50),
			allowNull: true
		},
		result: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		notifytime: {
			type: DataTypes.DATE,
			allowNull: true
		}
	}, {
		tableName: 't_server_notifys',
		timestamps: false,
		indexes: [{
				name: 'index_name',
				unique: false,
				fields: ['server_name']
			},
			{
				name: 'servernoticetime_i',
				unique: false,
				fields: ['notifytime']
			},
			{
				name: 'indx_server_id',
				unique: false,
				fields: ['server_id']
			}, {
				name: 'query_index',
				unique: false,
				fields: [`application`, `server_name`, `node_name`, `set_name`, `set_area`, `set_group`]
			}
		]
	});
};
