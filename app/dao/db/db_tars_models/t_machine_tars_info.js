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
	return sequelize.define('t_machine_tars_info', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			autoIncrement: true,
			unique: 'id' 
		},
		application: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
			primaryKey: true
		},
		server_name: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
			primaryKey: true
		},
		app_server_name: {
			type: DataTypes.STRING(50),
			allowNull: false,
			defaultValue: ''
		},
		node_name: {
			type: DataTypes.STRING(50),
			allowNull: false,
			defaultValue: '',
			primaryKey: true
		},
		location: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: ''
		},
		machine_type: {
			type: DataTypes.STRING(50),
			allowNull: false,
			defaultValue: ''
		},
		update_time: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		},
		update_person: {
			type: DataTypes.STRING(64),
			allowNull: false,
			defaultValue: ''
		}
	}, {
		tableName: 't_machine_tars_info',
		timestamps: false,
		indexes: [
			{
				name: 'tmachine_key',
				unique: true,
				fields: [`application`, `node_name`, `server_name`]
			},
			{
				name: 'tmachine_idx',
				unique: false,
				fields: [`node_name`, `server_name`]
			}
		]
	});
};
