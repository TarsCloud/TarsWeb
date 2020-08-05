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
	return sequelize.define('t_bm_case', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			autoIncrement: true,
			unique: "id"
		},
		servant: {
			type: DataTypes.STRING(128),
			allowNull: false,
			defaultValue: '',
			primaryKey: true
		},
		fn: {
			type: DataTypes.STRING(54),
			allowNull: false,
			defaultValue: '',
			primaryKey: true
		},
		des: {
			type: DataTypes.STRING(256),
			allowNull: true,
			defaultValue: ''
		},
		in_values: {
			type: DataTypes.TEXT,
			allowNull: true,
			defaultValue: ''
		},
		endpoints: {
			type: DataTypes.TEXT,
			allowNull: true,
			defaultValue: ''
		},
		links: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		speed: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		duration: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		posttime: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		},
		status: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue:0
		},
		results: {
			type: DataTypes.TEXT,
			allowNull: true,
			defaultValue: ''
		},
		is_deleted: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
		}
	}, {
		tableName: 't_bm_case',
		timestamps: false,
		indexes: [
			{
				unique: false,
				fields: ['servant', 'fn']
			}
		]
	});
};
