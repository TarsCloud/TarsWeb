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
	return sequelize.define('t_web_release_conf', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		server: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: ''
		},
		path: {
			type: DataTypes.STRING(200),
			allowNull: false,
			defaultValue: ''
		},
		server_dir: {
			type: DataTypes.STRING(200),
			allowNull: false,
			defaultValue: ''
		},
		is_server_group: {
			type: DataTypes.INTEGER(2),
			allowNull: false,
			defaultValue: '0'
		},
		enable_batch: {
			type: DataTypes.INTEGER(2),
			allowNull: false,
			defaultValue: '0'
		},
		user: {
			type: DataTypes.STRING(200),
			allowNull: false,
			defaultValue: '*'
		},
		posttime: {
			type: DataTypes.DATE,
			allowNull: true
		},
		lastuser: {
			type: DataTypes.STRING(60),
			allowNull: true
		}
	}, {
		tableName: 't_web_release_conf',
		timestamps: false,
		indexes: [{
				name: 'server',
				unique: true,
				fields: ['server', 'is_server_group']
			},
			{
				name: 'web_release_conf_server_index',
				unique: false,
				fields: ['server']
			}
		]
	});
};
