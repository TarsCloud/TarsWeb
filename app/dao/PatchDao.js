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

const {tServerPatchs} = require('./db').db_tars;
const {tCodeInterfaceConf, tPatchTask} = require('./db').db_tars_web;

const PatchDao = {}

PatchDao.find = async (where) => {
	return await tServerPatchs.findOne({
		where
	})
},
PatchDao.insertServerPatch = async (params) => {
		return await tServerPatchs.create(params);
	},

PatchDao.insertPatchTask = async (params) => {
	return await tPatchTask.create(params);
},

PatchDao.getServerPatch = async (server, curPage, pageSize, package_type) => {
	var opts = {
		order: [
			['id', 'desc']
		],
		where: {
			server: server
		}
	};
	if (package_type !== undefined) opts.where.package_type = package_type;
	if (curPage && pageSize) {
		Object.assign(opts, {
			limit: pageSize,
			offset: pageSize * (curPage - 1)
		})
	}
	return await tServerPatchs.findAndCountAll(opts);
},

PatchDao.destroyServePatch = async (id) => {
	return await tServerPatchs.destroy({where: {id: id}});
},

PatchDao.setPatchPackageDefault = async ({id, application, module_name, package_type}) => {
	await tServerPatchs.update({
		default_version: 0
	}, {
		where: {
			server: application + '.' + module_name,
			default_version: 1,
			package_type
		}
	});
	return await tServerPatchs.update({
		default_version: 1
	}, {
		where: {id}
	});
},

PatchDao.getServerPatchByPkgName = async (name) => {
	return await tServerPatchs.findOne({
		where: {
			tgz: name
		},
		raw: true
	});
},

PatchDao.getPackageByTaskId = async (taskId) => {
	return await tPatchTask.findOne({
		where: {
			task_id: taskId
		},
		raw: true
	});
},

PatchDao.getCodeInfConf = async (app, module_name) => {
	return await tCodeInterfaceConf.findOne({
		where: {
			server: `${app}.${module_name}`
		},
		raw: true
	});
},

PatchDao.setCodeInfConf = async (params) => {
	return await tCodeInterfaceConf.upsert({
		server: `${params.application}.${params.module_name}`,
		path: params.path
	}, {
		server: `${params.application}.${params.module_name}`
	});
}

module.exports = PatchDao;