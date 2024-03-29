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

const dbTable = require('./db').db_tars.tDockerRegistry;
const Sequelize = require('sequelize');

const Dao = {};

Dao.add = async (params) => {
	return await dbTable.create({
		registry: params.registry,
		username: params.username,
		password: params.password,
		remark: params.remark,
		create_time: new Date(),
		update_time: new Date(),
	});
};

Dao.delete = async (id) => {
	return await dbTable.destroy({
		where: {
			id: id
		}
	});
};

Dao.update = async (params) => {
	return await dbTable.update({
		registry: params.registry || '',
		username: params.username || '',
		password: params.password || '',
		remark: params.remark,
		update_time: new Date(),
	}, {
		where: {
			id: params.id
		}
	});
};

Dao.getList = async () => {

	return await dbTable.findAll({
		raw: true,
	});
};

module.exports = Dao;