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

const PatchDao = require('../../dao/PatchDao');

const PatchService = {};

PatchService.addServerPatch = async (params) => {
	return await PatchDao.insertServerPatch(params);
};

PatchService.getServerPatch = async (application, server_name, curPage, pageSize, package_type) => {
	return await PatchDao.getServerPatch(`${application}.${server_name}`, curPage, pageSize, package_type);
};

PatchService.deleteServerPatchById = async (id) => {
	return await PatchDao.destroyServePatch(id);
};

PatchService.setPatchPackageDefault = async ({id, application, module_name, package_type}) => {
	return await PatchDao.setPatchPackageDefault({id, application, module_name, package_type})
};

PatchService.find = async ({where}) => {
	return await PatchDao.find(where)
};

PatchService.hasDcachePatchPackage = async () => {
	let has = true;
	let proxyDefaultPackage = await PatchDao.find({
		server: 'DCache.ProxyServer',
		default_version: 1,
		package_type: 0
	});
	let routerDefaultPackage = await PatchDao.find({
		server: 'DCache.RouterServer',
		default_version: 1,
		package_type: 0
	})
	let accessDefaultPackage = await PatchDao.find({
		server: 'DCache.CombinDbAccessServer',
		default_version: 1,
		package_type: 0
	})
	let cacheDefaultPackage = await PatchDao.find({
		server: 'DCache.DCacheServerGroup',
		default_version: 1,
		package_type: 1
	})
	let McacheDefaultPackage = await PatchDao.find({
		server: 'DCache.DCacheServerGroup',
		default_version: 1,
		package_type: 2
	})

	return !!proxyDefaultPackage && !!routerDefaultPackage && !!accessDefaultPackage && !!cacheDefaultPackage && !!McacheDefaultPackage


};

module.exports = PatchService;