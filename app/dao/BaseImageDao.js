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

const dbTable = require('./db').db_tars.tBaseImage;
const Sequelize = require('sequelize');
const Db = require('../dao/db/index')

const Dao = {};

Dao.add = async (params) => {
	console.log(params);

	return await dbTable.create({
		image: params.image,
		remark: params.remark,
		registryId: params.registryId,
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
		image: params.image,
		remark: params.remark,
		registryId: params.registryId,
		update_time: new Date(),
	}, {
		where: {
			id: params.id
		}
	});
};

Dao.findRegistryId = async (registryId) => {
	return await dbTable.findOne({
		raw: true,
		where: {
			registryId: registryId,
		}
	});
};

Dao.getList = async (offset, limit) => {

	if (limit < 0) {
		return await dbTable.findAndCountAll({
			raw: true,
		});
	} else {
		return await dbTable.findAndCountAll({
			raw: true,
			limit: limit,
			offset: offset,
		});
	}
};

Dao.getImageRegistryList = async () => {
	let sql = 'select a.id as id, a.image as image, b.registry as registry, b.remark as remark from t_base_image a join t_docker_registry b on a.registryId =b.id';
	return await Db['db_tars'].sequelize.query(sql, {
		raw: true,
		type: Sequelize.QueryTypes.SELECT,
	})
};

module.exports = Dao;