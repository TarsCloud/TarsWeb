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
	return sequelize.define('t_ats_interfaces', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		objname: {
			type: DataTypes.STRING(150),
			allowNull: true
		},
		funcname: {
			type: DataTypes.STRING(150),
			allowNull: true
		},
		retype: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		paramtype: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		outparamtype: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		interfaceid: {
			type: DataTypes.INTEGER(11),
			allowNull: true
		},
		postime: {
			type: DataTypes.DATE,
			allowNull: true
		},
		lastuser: {
			type: DataTypes.STRING(30),
			allowNull: true
		},
		request_charset: {
			type: DataTypes.STRING(16),
			allowNull: false
		},
		response_charset: {
			type: DataTypes.STRING(16),
			allowNull: false
		}
	}, {
		tableName: 't_ats_interfaces',
		timestamps: false,
		indexes: [{
			name: 'objname_idx',
			unique: true,
			fields: [`objname`, `funcname`]
		}]
	});
};
