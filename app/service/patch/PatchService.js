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

const fs = require('fs-extra');
const { patchPrx } = require('../../../rpc/index');
const { PatchStruct } = require('../../../rpc/struct');
const TarsStream  = require("@tars/stream");
const logger = require('../../../logger');
const util = require('../../../tools/util');

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

PatchService.uploadToPatch = async (md5, application, module_name, uploadTgzName, localTgzPath) => {

	let content = new PatchStruct.FileContent();
	content.md5 = md5;
	content.name = uploadTgzName;
		
	let fd = await fs.open(localTgzPath, "r");

	let stat = fs.fstatSync(fd);

	let offset = 0;

	let hash = {
        hashCode: util.getHashNumber(md5)
	}
	
	do {
		let length = Math.min(1024 * 1024 * 5, stat.size - offset);
	
		var buffer = Buffer.alloc(length);
	
		await fs.read(fd, buffer, offset, length);

		content.firstChunk = offset == 0;
		content.lastChunk = (offset + length == stat.size);

		content.content = new TarsStream.BinBuffer(buffer);

		let ret = await patchPrx.upload(application, module_name, content, hash);

		logger.info(`uploadToPatch file: ${localTgzPath}, md5: ${md5}, size: ${stat.size}, offset: ${offset}, length: ${length}, buffer length: ${buffer.length}`);

		if (ret.__return != 0) {
            logger.error('[PatchService.upload to patch error] ret:', ret);
			return ret.__return;
		}

		offset += length;

	} while (!content.lastChunk);

	return 0;
};

module.exports = PatchService;