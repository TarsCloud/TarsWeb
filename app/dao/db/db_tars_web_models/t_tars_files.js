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
	return sequelize.define('t_tars_files', {
		f_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			autoIncrement: true,
			unique: "f_id"
		},
		application: {
			type: DataTypes.STRING(64),
			allowNull: false,
			defaultValue: ''
		},
		server_name: {
			type: DataTypes.STRING(128),
			allowNull: false,
			defaultValue: '',
			primaryKey: true
		},
		file_name: {
			type: DataTypes.STRING(64),
			allowNull: false,
			defaultValue: '',
			primaryKey: true
		},
		posttime: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		},
		context: {
			type: DataTypes.TEXT('medium'),
			allowNull: true
		},
		benchmark_context: {
			type: DataTypes.TEXT('medium'),
			allowNull: true
		}
	}, {
		tableName: 't_tars_files',
		timestamps: false,
		indexes: [{
			unique: false,
			fields: ['server_name', 'file_name']
		}]
	});
};
