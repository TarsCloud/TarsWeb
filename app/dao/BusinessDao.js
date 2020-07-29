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

const dbTable = require('./db').db_tars_web.tBusiness;
const Sequelize = require('sequelize');

const Dao = {};

Dao.add = async (params) => {
	return await dbTable.create({
		f_name: params.f_name,
		f_show_name: params.f_show_name,
		f_create_person: params.f_create_person,
		f_create_time: params.f_create_time,
		f_update_person: params.f_update_person,
		f_update_time: params.f_update_time,
		f_order: params.f_order,
	});
};

Dao.delete = async (id) => {
	return await dbTable.destroy({
		where: {
			f_id: id
		}
	});
};

Dao.update = async (params) => {
	return await dbTable.update({
		f_name: params.f_name,
		f_show_name: params.f_show_name,
		f_order: params.f_order,
	}, {
		where: {
			f_id: params.f_id
		}
	});
};

Dao.getById = async (id) => {
	return await dbTable.findOne({
		where: {
			f_id: id,
		}
	});
};

Dao.getList = async (name) => {
	const where = {}
	if(name) {
		where.f_name = {
			[Sequelize.Op.like]: `%${name}%`,
		}
	}
	return await dbTable.findAll({ where, order: [['f_order', 'DESC'], ['f_name', 'ASC']] });
};

module.exports = Dao;
