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
	return sequelize.define('t_server_patchs', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		server: {
			type: DataTypes.STRING(50),
			allowNull: true
		},
		version: {
			type: DataTypes.STRING(1000),
			allowNull: true,
			defaultValue: ''
		},
		tgz: {
			type: DataTypes.STRING(255),
			allowNull: true
		},
		update_text: {
			type: DataTypes.STRING(255),
			allowNull: true
		},
		reason_select: {
			type: DataTypes.STRING(255),
			allowNull: true
		},
		document_complate: {
			type: DataTypes.STRING(30),
			allowNull: true
		},
		is_server_group: {
			type: DataTypes.INTEGER(2),
			allowNull: false,
			defaultValue: '0'
		},
		publish: {
			type: DataTypes.INTEGER(3),
			allowNull: true
		},
		publish_time: {
			type: DataTypes.DATE,
			allowNull: true
		},
		publish_user: {
			type: DataTypes.STRING(30),
			allowNull: true
		},
		upload_time: {
			type: DataTypes.DATE,
			allowNull: true
		},
		upload_user: {
			type: DataTypes.STRING(30),
			allowNull: true
		},
		posttime: {
			type: DataTypes.DATE,
			allowNull: true
		},
		lastuser: {
			type: DataTypes.STRING(30),
			allowNull: true
		},
		is_release_version: {
			type: DataTypes.ENUM('true','false'),
			allowNull: true,
			defaultValue: 'true'
		},
		package_type: {
			type: DataTypes.INTEGER(4),
			allowNull: true,
			defaultValue: '0'
		},
		group_id: {
			type: DataTypes.STRING(64),
			allowNull: false,
			defaultValue: ''
		},
		default_version: {
			type: DataTypes.INTEGER(4),
			allowNull: true,
			defaultValue: '0'
		},
		md5: {
			type: DataTypes.STRING(40),
			allowNull: true
		},
		svn_version: {
			type: DataTypes.STRING(50),
			allowNull: true
		}
	}, {
		tableName: 't_server_patchs',
		timestamps: false,
		indexes: [{
				name: 'server_patchs_server_index',
				unique: false,
				fields: ['server']
			},
			{
				name: 'index_i',
				unique: false,
				fields: ['tgz']
			}
		]
	});
};
