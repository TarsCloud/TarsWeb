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

const {
	tPlugin
} = require('./db').db_tars_web;
// const Sequelize = require('sequelize');
const PluginDao = {};

PluginDao.listPlugins = async (type) => {

	// console.log(type);

	if (type) {
		return await tPlugin.findAll({
			raw: true,
			where: {
				f_type: type
			}
		});
	} else {
		return await tPlugin.findAll({
			raw: true,
		});
	}
};

PluginDao.updatePlugin = async (paramsObj) => {
	return await tPlugin.upsert(paramsObj, {
		where: {
			f_obj: paramsObj.f_obj
		}
	})
};

PluginDao.deletePlugin = async (id) => {
	return await tPlugin.destroy({
		where: {
			f_id: id
		}
	});
};


module.exports = PluginDao;