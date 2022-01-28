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
const {
	patchPrx
} = require('../../../rpc/index');
const {
	PatchStruct
} = require('../../../rpc/struct');
const TarsStream = require("@tars/stream");
const logger = require('../../../logger');
const util = require('../../../tools/util');
const AuthService = require('../../service/auth/AuthService');
const CompileService = require('../../service/patch/CompileService');
const ServerService = require('../../service/server/ServerService');
const TaskService = require('../../service/task/TaskService');
const md5Sum = require('md5-file').sync;
const PatchDao = require('../../dao/PatchDao');
const WebConf = require('../../../config/WebConf');
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

PatchService.setPatchPackageDefault = async ({
	id,
	application,
	module_name,
	package_type
}) => {
	return await PatchDao.setPatchPackageDefault({
		id,
		application,
		module_name,
		package_type
	})
};

PatchService.find = async ({
	where
}) => {
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

//for cloud
PatchService.uploadAndPatch = async (application,
	module_name,
	md5,
	task_id,
	comment,
	package_type,
	filename,
	fieldname,
	uid) => {
	try {

		package_type = package_type || 0;

		if (!await AuthService.hasDevAuth(application, module_name, uid)) {
			ctx.makeNotAuthResObj();
		} else {
			if (!filename) {
				logger.error('[uploadAndPatch]:', 'no files');
				return {
					code: 500,
					err_msg: "no files"
				};
			}
			let baseUploadPath = WebConf.pkgUploadPath.path;
			// 发布包上传目录
			let updateTgzPath = `${baseUploadPath}/${application}/${module_name}`;
			await fs.ensureDirSync(updateTgzPath);
			let hash = md5Sum(`${baseUploadPath}/${filename}`);
			if (md5 && md5 != hash) {
				logger.error('[uploadAndPatch]:', '#patch.md5#');
				return {
					code: 500,
					err_msg: "#patch.md5#"
				};
			}
			let uploadTgzName = `${application}.${module_name}_${fieldname}_${new Date().getTime()}.tgz`;
			// logger.info('[newTgzName] -> ', `${updateTgzPath}/${uploadTgzName}`);
			logger.info('[orgTgzName] -> ', `${baseUploadPath}/${filename}`);
			// fs.renameSync(`${baseUploadPath}/${filename}`, `${updateTgzPath}/${uploadTgzName}`);

			// fs.copyFileSync(`${baseUploadPath}/${filename}`, `${updateTgzPath}/${uploadTgzName}`);

			let paramsObj = {
				server: `${application}.${module_name}`,
				tgz: uploadTgzName,
				md5: hash,
				update_text: comment || '',
				task_id: task_id,
				package_type: package_type || '0',
				posttime: new Date(),
				upload_time: new Date(),
				upload_user: uid
			};

			if (WebConf.isEnableK8s()) {

				logger.info('[newTgzName] copy tarspatch');
				//上传到patch服务
				let ret = await PatchService.uploadToPatch(hash, application, module_name, uploadTgzName, baseUploadPath + '/' + filename);
				if (ret != 0) {
					return {
						code: 500,
						err_msg: "upload to patch error"
					};
				}

			} else {
				logger.info('[newTgzName] -> ', `${updateTgzPath}/${uploadTgzName}`);
				fs.renameSync(`${baseUploadPath}/${filename}`, `${updateTgzPath}/${uploadTgzName}`);
			}

			logger.info('[uploadAndPatch addServerPatch:]', paramsObj);

			let ret = await PatchService.addServerPatch(paramsObj);

			await CompileService.addPatchTask(paramsObj);

			let data = util.viewFilter(ret, {
				id: '',
				server: '',
				tgz: '',
				update_text: {
					key: 'comment'
				},
				posttime: {
					formatter: util.formatTimeStamp
				},
			});

			let patch = await CompileService.getServerPatchByTaskId(task_id);

			data.serverIds = [];

			let serverIds = util.viewFilter(await ServerService.getServerConfList4Tree({
				application,
				serverName: module_name
			}));

			let task_no = util.getUUID().toString();
			let serial = true;
			let items = [];


			for (let index = 0; index < serverIds.length; index++) {

				items.push({
					server_id: serverIds[index].id,
					command: "patch_tars",
					parameters: {
						patch_id: patch.id
					}
				});

				data.serverIds.push(serverIds[index].id);
			}

			if (items.length > 0) {
				await TaskService.addTask({
					serial,
					items,
					task_no,
					userName: uid
				});
			}

			return {
				code: 200,
				data: data
			};
		}
	} catch (e) {
		logger.error('[uploadAndPatch]:', e);

		return e.toString();
		// ctx.makeErrResObj(500, e.toString());
	}

};

PatchService.uploadToPatch = async (md5, application, module_name, uploadTgzName, localTgzPath) => {

	let content = new PatchStruct.FileContent();
	content.md5 = md5;
	content.name = uploadTgzName;

	let fd = await fs.open(localTgzPath, "r");

	let stat = fs.fstatSync(fd);

	logger.info(`uploadToPatch ${localTgzPath}, size:`, stat.size);

	let offset = 0;

	let hash = {
		hashCode: util.getHashNumber(md5)
	}

	do {
		let length = Math.min(1024 * 1024 * 5, stat.size - offset);

		var buffer = Buffer.alloc(length);

		logger.info(`uploadToPatch ${localTgzPath}, offset: ${offset}, length: ${length}`, );

		await fs.read(fd, buffer, 0, length, offset);

		content.firstChunk = offset == 0;
		content.lastChunk = (offset + length == stat.size);

		content.content = new TarsStream.BinBuffer(buffer);

		let ret = await patchPrx.upload(application, module_name, content, hash);

		logger.info(`uploadToPatch file: ${localTgzPath}, md5: ${md5}, size: ${stat.size}, offset: ${offset}, length: ${length}, buffer length: ${buffer.length}`);

		if (ret.__return != 0) {
			logger.error('[PatchService.upload to patch error] ret:', ret);
			fs.close(fd);
			return ret.__return;
		}

		offset += length;

	} while (!content.lastChunk);

	fs.close(fd);

	return 0;
};

module.exports = PatchService;