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

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('t_framework_key', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		key: {
			type: DataTypes.STRING(16),
			allowNull: false,
			unique: 'idx_key',
		},
		cuid: {
			type: DataTypes.STRING(128),
			allowNull: false,
			defaultValue: '',
		},
		pri_key: {
			type: DataTypes.STRING(128),
			allowNull: false,
			defaultValue: '',
		},
		autologin: {
			type: DataTypes.INTEGER,
			defaultValue: 1,
			allowNull: true,
		},
		update_time: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		}
	}, {
		tableName: 't_framework_key',
		timestamps: false
	});
};