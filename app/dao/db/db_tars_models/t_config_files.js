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
	return sequelize.define('t_config_files', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		server_name: {
			type: DataTypes.STRING(128),
			allowNull: true,
			defaultValue: ''
		},
		set_name: {
			type: DataTypes.STRING(16),
			allowNull: false,
			defaultValue: ''
		},
		set_area: {
			type: DataTypes.STRING(16),
			allowNull: false,
			defaultValue: ''
		},
		set_group: {
			type: DataTypes.STRING(16),
			allowNull: false,
			defaultValue: ''
		},
		host: {
			type: DataTypes.STRING(20),
			allowNull: false,
			defaultValue: ''
		},
		filename: {
			type: DataTypes.STRING(128),
			allowNull: true
		},
		config: {
			type: DataTypes.TEXT('long'),
			allowNull: true
		},
		posttime: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		},
		lastuser: {
			type: DataTypes.STRING(50),
			allowNull: true
		},
		level: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue: 2
		},
		config_flag: {
			type: DataTypes.INTEGER(10),
			allowNull: false,
			defaultValue: 0
		}
	}, {
		tableName: 't_config_files',
		timestamps: false,
		indexes: [{
			name: 'application',
			unique: true,
			fields: [`server_name`, `filename`, `host`, `level`, `set_name`, `set_area`, `set_group`]
		}]
	});
};
