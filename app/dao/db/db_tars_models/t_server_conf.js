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
	return sequelize.define('t_server_conf', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		application: {
			type: DataTypes.STRING(128),
			allowNull: true,
			defaultValue: '',
			unique: 'app_server_ip'
		},
		server_name: {
			type: DataTypes.STRING(128),
			allowNull: true,
			defaultValue: '',
			unique: 'app_server_ip'
		},
		node_group: {
			type: DataTypes.STRING(50),
			allowNull: false,
			defaultValue: ''
		},
		node_name: {
			type: DataTypes.STRING(50),
			allowNull: false,
			defaultValue: '',
			unique: 'app_server_ip'
		},
		registry_timestamp: {
			type: 'DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)',
			allowNull: false,
			defaultValue: DataTypes.NOW
		},
		base_path: {
			type: DataTypes.STRING(128),
			allowNull: true,
			defaultValue: ''
		},
		exe_path: {
			type: DataTypes.STRING(128),
			allowNull: false,
			defaultValue: ''
		},
		template_name: {
			type: DataTypes.STRING(128),
			allowNull: false,
			defaultValue: ''
		},
		bak_flag: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: 0
		},
		setting_state: {
			type: DataTypes.ENUM('active','inactive'),
			allowNull: false,
			defaultValue: 'inactive'
		},
		present_state: {
			type: DataTypes.ENUM('active','inactive','activating','deactivating','destroyed'),
			allowNull: false,
			defaultValue: 'inactive'
		},
        flow_state: {
        	type: DataTypes.ENUM('active', 'inactive'),
        	allowNull: false,
        	defaultValue: 'active'
        },
		process_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0'
		},
		patch_version: {
			type: DataTypes.STRING(128),
			allowNull: false,
			defaultValue: ''
		},
		patch_time: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: new Date() 
		},
		patch_user: {
			type: DataTypes.STRING(128),
			allowNull: false,
			defaultValue: ''
		},
		tars_version: {
			type: DataTypes.STRING(128),
			allowNull: false,
			defaultValue: ''
		},
		posttime: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		lastuser: {
			type: DataTypes.STRING(30),
			allowNull: true
		},
		server_type: {
			type: DataTypes.ENUM('tars_cpp','not_tars','tars_java','tars_nodejs','tars_php','tars_go'),
			allowNull: true
		},
		start_script_path: {
			type: DataTypes.STRING(128),
			allowNull: true
		},
		stop_script_path: {
			type: DataTypes.STRING(128),
			allowNull: true
		},
		monitor_script_path: {
			type: DataTypes.STRING(128),
			allowNull: true
		},
		enable_group: {
			type: DataTypes.CHAR(1),
			allowNull: true,
			defaultValue: 'N'
		},
		enable_set: {
			type: DataTypes.CHAR(1),
			allowNull: false,
			defaultValue: 'N'
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
			type: DataTypes.STRING(64),
			allowNull: true
		},
		ip_group_name: {
			type: DataTypes.STRING(64),
			allowNull: true
		},
		profile: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		config_center_port: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0'
		},
		async_thread_num: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue: '3'
		},
		server_important_type: {
			type: DataTypes.ENUM('0','1','2','3','4','5'),
			allowNull: true,
			defaultValue: '0'
		},
		remote_log_reserve_time: {
			type: DataTypes.STRING(32),
			allowNull: false,
			defaultValue: '65'
		},
		remote_log_compress_time: {
			type: DataTypes.STRING(32),
			allowNull: false,
			defaultValue: '2'
		},
		remote_log_type: {
			type: DataTypes.INTEGER(1),
			allowNull: false,
			defaultValue: '0'
		}
	}, {
		tableName: 't_server_conf',
		timestamps: false,
		indexes: [{
				name: 'node_name',
				unique: false,
				fields: ['node_name']
			},
			{
				name: 'index_i',
				unique: false,
				fields: ['setting_state', 'server_type', 'application', 'server_name', 'node_name']
			},
			{
				name: 'index_regtime',
				unique: false,
				fields: ['registry_timestamp']
			}
		]
	});
};
