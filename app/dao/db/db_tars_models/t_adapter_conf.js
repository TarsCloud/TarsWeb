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
	return sequelize.define('t_adapter_conf', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		application: {
			type: DataTypes.STRING(50),
			allowNull: true,
			defaultValue: ''
		},
		server_name: {
			type: DataTypes.STRING(128),
			allowNull: true,
			defaultValue: ''
		},
		node_name: {
			type: DataTypes.STRING(50),
			allowNull: true,
			defaultValue: ''
		},
		adapter_name: {
			type: DataTypes.STRING(100),
			allowNull: true,
			defaultValue: ''
		},
		registry_timestamp: {
			type: 'DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)',
			allowNull: false,
			defaultValue: DataTypes.NOW
		},
		thread_num: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue: '1'
		},
		endpoint: {
			type: DataTypes.STRING(128),
			allowNull: true,
			defaultValue: ''
		},
		max_connections: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue: '1000'
		},
		allow_ip: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: ''
		},
		servant: {
			type: DataTypes.STRING(128),
			allowNull: true,
			defaultValue: ''
		},
		queuecap: {
			type: DataTypes.INTEGER(11),
			allowNull: true
		},
		queuetimeout: {
			type: DataTypes.INTEGER(11),
			allowNull: true
		},
		posttime: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		lastuser: {
			type: DataTypes.STRING(30),
			allowNull: true
		},
		protocol: {
			type: DataTypes.STRING(64),
			allowNull: true,
			defaultValue: 'tars'
		},
		handlegroup: {
			type: DataTypes.STRING(64),
			allowNull: true,
			defaultValue: ''
		}
	}, {
		tableName: 't_adapter_conf',
		timestamps: false,
		indexes: [{
				name: 'application',
				unique: true,
				fields: [`application`, `server_name`, `node_name`, `adapter_name`]
			},
			{
				name: 'adapter_conf_endpoint_index',
				unique: false,
				fields: ['endpoint']
			},
			{
				name: 'index_regtime',
				unique: false,
				fields: ['registry_timestamp']
			}
		]
	});
};
