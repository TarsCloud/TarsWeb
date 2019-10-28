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

const logger = require('../../logger');
const InfTestService = require('../../service/infTest/InfTestService');
const AuthService = require('../../service/auth/AuthService');
const WebConf = require('../../../config/webConf');
const util = require('../../tools/util');
const fs = require('fs-extra');

const InfTestController = {};

InfTestController.interfaceDebug = async (ctx) => {
	try {
		const {id, objName, application, server_name, module_name, interface_name, function_name, params} = ctx.paramsObj;
		if (!await AuthService.hasDevAuth(application, server_name, ctx.uid)) {
			ctx.makeNotAuthResObj();
		} else {
			let rsp = await InfTestService.debug({
				id,
				objName,
				moduleName: module_name,
				interfaceName: interface_name,
				functionName: function_name,
				params
			});
			ctx.makeResObj(200, '', JSON.stringify(rsp));
		}
	} catch (e) {
		logger.error('[interfaceDebug]:', e, ctx);
		console.error(e);
		ctx.makeResObj(500, e.message);
	}
}

InfTestController.uploadTarsFile = async (ctx) => {
	let {application, server_name, set_name} = ctx.paramsObj;
	// tars文件上传目录，和发布包同一个根目录
	let baseUploadPath = WebConf.pkgUploadPath.path;
	let tarsFilePath = `${baseUploadPath}/tars_files/${application}/${server_name}`;
	try {
		await fs.ensureDirSync(tarsFilePath);
		if (!await AuthService.hasDevAuth(application, server_name, ctx.uid)) {
			ctx.makeNotAuthResObj();
		} else {
			let files = ctx.req.files;
			if (!files.length) {
				logger.error('[uploadTarsFile]:', 'no files', ctx);
				throw new Error('[uploadTarsFile]: no files');
			}
			// 检查文件类型并重命名文件
			for (let file of files) {
				if (!(/\.tars$/gi.test(file.originalname) && file.mimetype === 'application/octet-stream')) {
					logger.error('[uploadTarsFile]:', 'only accept .tars files', ctx);
					throw new Error('[uploadTarsFile]: #pub.dlg.filetype#');
				}
				await fs.rename(`${baseUploadPath}/${file.filename}`, `${tarsFilePath}/${file.originalname}`);
			}
			// 解析并入库
			let ret = [];
			for (let file of files) {
				const context = await InfTestService.getContext(`${tarsFilePath}/${file.originalname}`);
				ret.push(await InfTestService.addTarsFile({
					application: application,
					server_name: server_name,
					file_name: file.originalname,
					context: JSON.stringify(context),
					posttime: new Date()
				}));
			}
			ctx.makeResObj(200, '', ret);
		}
	} catch (e) {
		logger.error('[uploadTarsFile]:', e, ctx);
		ctx.makeErrResObj();
	} finally {
		// 删除重命名后的文件
		fs.remove(`${tarsFilePath}`);
	}
}

InfTestController.getFileList = async (ctx) => {
	try {
		let {application, server_name} = ctx.paramsObj;
		if (!await AuthService.hasDevAuth(application, server_name, ctx.uid)) {
			ctx.makeNotAuthResObj();
		} else {
			let ret = await InfTestService.getTarsFile({
				application: application,
				server_name: server_name
			}, ['f_id', 'application', 'server_name', 'file_name', 'posttime']);
			ctx.makeResObj(200, '', util.viewFilter(ret, {
				f_id: '',
				application: '',
				server_name: '',
				file_name: '',
				posttime: {formatter: util.formatTimeStamp}
			}));
		}
	} catch (e) {
		logger.error('[getFileList]:', e, ctx);
		ctx.makeErrResObj();
	}
}

InfTestController.getContexts = async (ctx) => {
	try {
		let {id, application, server_name, type, module_name, interface_name} = ctx.paramsObj;
		if (!await AuthService.hasDevAuth(application, server_name, ctx.uid)) {
			ctx.makeNotAuthResObj();
		} else {
			let contexts;
			if (type == 'all') {
				contexts = await InfTestService.getAllData(id);
			} else if (type == 'module') {
				contexts = await InfTestService.getModuleData(id);
			} else if (type == 'interface') {
				contexts = await InfTestService.getInterfaceData(id, module_name);
			} else if (type == 'function') {
				contexts = await InfTestService.getFunctionData(id, module_name, interface_name);
			}
			ctx.makeResObj(200, '', contexts);
		}
	} catch (e) {
		logger.error('[getContexts]:', e, ctx);
		ctx.makeErrResObj();
	}
}

InfTestController.getParams = async (ctx) => {
	try {
		let {application, server_name, id, module_name, interface_name, function_name} = ctx.paramsObj;
		if (!await AuthService.hasDevAuth(application, server_name, ctx.uid)) {
			ctx.makeNotAuthResObj();
		} else {
			let params = await InfTestService.getParams(id, module_name, interface_name, function_name);
			ctx.makeResObj(200, '', params);
		}
	} catch (e) {
		logger.error('[getContexts]:', e, ctx);
		ctx.makeErrResObj();
	}
}

InfTestController.deleteTarsFile = async (ctx) => {
	try {
		let {id} = ctx.paramsObj;
		ctx.makeResObj(200, '', await InfTestService.deleteTarsFile(id));
	} catch (e) {
		logger.error('[deleteTarsFile]:', e, ctx);
		ctx.makeErrResObj();
	}
}

InfTestController.getStructs = async (ctx) => {
	try {
		let {id, module_name} = ctx.paramsObj;
		let ret = await InfTestService.getStructs(id, module_name);
		ctx.makeResObj(200, '', ret);
	} catch (e) {
		logger.error('[deleteTarsFile]:', e, ctx);
		ctx.makeErrResObj();
	}
}

module.exports = InfTestController;