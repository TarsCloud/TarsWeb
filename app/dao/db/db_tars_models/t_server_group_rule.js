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
	return sequelize.define('t_server_group_rule', {
		group_id: {
			type: DataTypes.INTEGER(10).UNSIGNED,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		ip_order: {
			type: DataTypes.ENUM('allow_denny','denny_allow'),
			allowNull: false,
			defaultValue: 'denny_allow'
		},
		allow_ip_rule: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		denny_ip_rule: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		lastuser: {
			type: DataTypes.STRING(50),
			allowNull: true
		},
		modify_time: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		},
		group_name: {
			type: DataTypes.STRING(128),
			allowNull: true,
			defaultValue: '',
			unique: 'group_name'
		},
		group_name_cn: {
			type: DataTypes.STRING(128),
			allowNull: true,
			defaultValue: ''
		}
	}, {
		tableName: 't_server_group_rule',
		timestamps: false
	});
};
