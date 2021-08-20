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
	return sequelize.define('t_node_info', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		node_name: {
			type: DataTypes.STRING(128),
			allowNull: true,
			defaultValue: '',
			unique: 'node_name'
		},
		node_obj: {
			type: DataTypes.STRING(128),
			allowNull: true,
			defaultValue: ''
		},
		endpoint_ip: {
			type: DataTypes.STRING(16),
			allowNull: true,
			defaultValue: ''
		},
		endpoint_port: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue: '0'
		},
		data_dir: {
			type: DataTypes.STRING(128),
			allowNull: true,
			defaultValue: ''
		},
		load_avg1: {
			type: DataTypes.FLOAT,
			allowNull: true,
			defaultValue: '0'
		},
		load_avg5: {
			type: DataTypes.FLOAT,
			allowNull: true,
			defaultValue: '0'
		},
		load_avg15: {
			type: DataTypes.FLOAT,
			allowNull: true,
			defaultValue: '0'
		},
		last_reg_time: {
			type: DataTypes.DATE,
			allowNull: true,
			defaultValue: '1970-01-01 00:08:00'
		},
		last_heartbeat: {
			type: DataTypes.DATE,
			allowNull: true,
			defaultValue: '1970-01-01 00:08:00'
		},
		setting_state: {
			type: DataTypes.ENUM('active','inactive'),
			allowNull: true,
			defaultValue: 'inactive'
		},
		present_state: {
			type: DataTypes.ENUM('active','inactive'),
			allowNull: true,
			defaultValue: 'inactive'
		},
		tars_version: {
			type: DataTypes.STRING(128),
			allowNull: false,
			defaultValue: ''
		},
		template_name: {
			type: DataTypes.STRING(128),
			allowNull: false,
			defaultValue: ''
		},
		modify_time: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		},
		label: {
			type: DataTypes.TEXT,
			allowNull: true,
			defaultValue: ''
		},
		group_id: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue: '-1'
		}
	}, {
		tableName: 't_node_info',
		timestamps: false,
		indexes: [{
				name: 'indx_node_info',
				unique: false,
				fields: [`last_heartbeat`]
			}
		]
	});
};
