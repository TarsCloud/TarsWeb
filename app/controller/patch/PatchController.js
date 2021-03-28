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
const PatchService = require('../../service/patch/PatchService');
const CompileService = require('../../service/patch/CompileService');
const AuthService = require('../../service/auth/AuthService');
const AdminService = require('../../service/admin/AdminService');
const ServerService = require('../../service/server/ServerService');
const TaskService = require('../../service/task/TaskService');
const WebConf = require('../../../config/webConf');
const util = require('../../tools/util');
const fs = require('fs-extra');
const md5Sum = require('md5-file').sync;
const send = require('koa-send');
const path = require('path');

const PatchController = {};

PatchController.sleep = (timeountMS) => new Promise((resolve) => {
	setTimeout(resolve, timeountMS);
  });

PatchController.uploadAndPublish = async (ctx) => {
	try {

		let task_id = util.getUUID().toString();
		// let package_type = 0;

		let { application, module_name, comment, package_type} = ctx.req.body;

		let file = ctx.req.files[0];
		if (!file) {
			ctx.body = "upload not files";
			return;
		}
		let baseUploadPath = WebConf.pkgUploadPath.path;
		// 发布包上传目录
		let updateTgzPath = `${baseUploadPath}/${application}/${module_name}`;
		// console.info('updateTgzPath:', updateTgzPath);
		await fs.ensureDirSync(updateTgzPath);
		let hash = md5Sum(`${baseUploadPath}/${file.filename}`);

		let uploadTgzName = `${application}.${module_name}_${file.fieldname}_${new Date().getTime()}.tgz`;
		logger.info('[newTgzName]:', `${updateTgzPath}/${uploadTgzName}`);
		logger.info('[orgTgzName]:', `${baseUploadPath}/${file.filename}`);
		await fs.rename(`${baseUploadPath}/${file.filename}`, `${updateTgzPath}/${uploadTgzName}`);
		let paramsObj = {
			server: `${application}.${module_name}`,
			tgz: uploadTgzName,
			md5: hash,
			update_text: comment || '',
			task_id: task_id,
			package_type: package_type || '0',
			posttime: new Date()
		};
		logger.info('[addServerPatch:]', paramsObj);
		let ret = await PatchService.addServerPatch(paramsObj);
		await CompileService.addPatchTask(paramsObj).catch((err) => {
			logger.error('[CompileService.addPatchTask]:', err);
		});

		let patch = await CompileService.getServerPatchByTaskId(task_id);

		let serverIds = util.viewFilter(await ServerService.getServerConfList4Tree({application, serverName: module_name}));

		let task_no = util.getUUID().toString();
		let serial = true;
		let items = [];

        ctx.body += "\n";
        for (let index = 0; index < serverIds.length; index++) {
            if (serverIds[index].setting_state == "inactive") {
                continue;
            }
            ctx.body += "patch serverId: " + serverIds[index].id + ", node_name: " + serverIds[index].node_name + "\n";
            items.push({ server_id: serverIds[index].id, command: "patch_tars", parameters: { patch_id: patch.id } });
        }

		if (items.length > 0) {
			await TaskService.addTask({ serial, items, task_no, userName: 'auto-developer' });

			while (true) {
				await PatchController.sleep(2000);
				ret = await TaskService.getTaskRsp(task_no);
				if (ret.status != 1) {
					break;
				}
			}

			let info = "-----------------------------------------------------------------\n";
			info += "task no:  [" + ret.task_no + "]\n\n";
			for (var index = 0; index < ret.items.length; ++index) {
				let node = ret.items[index];
				info += node.node_name + " " + node.status_info + " " + node.execute_info + "\n";
			}
			ctx.body += info;
		} else {
			ctx.body = "no active server, please start server first!\r\n";

		}

	} catch (e) {
		ctx.body = "upload and patch err:" + e;
	}

};

PatchController.uploadPatchPackage = async (ctx) => {
	try {
		let {application, module_name, md5, task_id, comment, package_type} = ctx.req.body;

		package_type = package_type || 0;

		if (!await AuthService.hasDevAuth(application, module_name, ctx.uid)) {
			ctx.makeNotAuthResObj();
		} else {
			let file = ctx.req.files[0];
			if (!file) {
				logger.error('[uploadPatchPackage]:', 'no files');
				return ctx.makeErrResObj(500, 'no files');
			}
			let baseUploadPath = WebConf.pkgUploadPath.path;
			// 发布包上传目录
			let updateTgzPath = `${baseUploadPath}/${application}/${module_name}`;
			// console.info('updateTgzPath:', updateTgzPath);
			await fs.ensureDirSync(updateTgzPath);
			let hash = md5Sum(`${baseUploadPath}/${file.filename}`);
			if (md5 && md5 != hash) {
				logger.error('[uploadPatchPackage]:', '#patch.md5#');
				return ctx.makeErrResObj(500, '#patch.md5#');
			}
			let uploadTgzName = `${application}.${module_name}_${file.fieldname}_${new Date().getTime()}.tgz`;
			logger.info('[newTgzName]:', `${updateTgzPath}/${uploadTgzName}`);
			logger.info('[orgTgzName]:', `${baseUploadPath}/${file.filename}`);
			await fs.rename(`${baseUploadPath}/${file.filename}`, `${updateTgzPath}/${uploadTgzName}`);
			let paramsObj = {
				server: `${application}.${module_name}`,
				tgz: uploadTgzName,
				md5: hash,
				update_text: comment || '',
				task_id: task_id,
				package_type: package_type || '0',
                posttime: new Date(),
                upload_time:new Date(),
                upload_user:ctx.uid
			};
			logger.info('[addServerPatch:]', paramsObj);
			let ret = await PatchService.addServerPatch(paramsObj);
			await CompileService.addPatchTask(paramsObj).catch((err) => {
				logger.error('[CompileService.addPatchTask]:', err);
			});

			let data = util.viewFilter(ret, {
				id: '',
				server: '',
				tgz: '',
				update_text: {key: 'comment'},
				posttime: {formatter: util.formatTimeStamp}
			});

			let id = data.id;
			let package = { id, application, module_name, package_type };

			//dcache的包, 设置为缺省包
			await PatchService.setPatchPackageDefault(package);

			// ctx.body = "upload succ and set this package to default package!\r\n";
			//ctx.makeResObj(200, '', "upload succ and set this package to default package!");
			ctx.makeResObj(200, '', data);
		}
	} catch (e) {
		logger.error('[PatchController.uploadPatchPackage]:', e, ctx);
		ctx.makeErrResObj(500, e.toString());
	}

};

PatchController.serverPatchList = async (ctx) => {
	let { application, module_name, curr_page = 0, page_size = 0, package_type } = ctx.paramsObj;
	try {
		if (!await AuthService.hasOpeAuth(application, module_name, ctx.uid)) {
			ctx.makeNotAuthResObj();
		} else {

			let ret = await PatchService.getServerPatch(application, module_name, parseInt(curr_page), parseInt(page_size), package_type);
			// console.log(ret);
			ctx.makeResObj(200, '', {
				count: ret.count,
				rows: util.viewFilter(ret.rows, {
					package_type: '',
					default_version: '',
					id: '',
					server: '',
					tgz: '',
					publish_time: {formatter: util.formatTimeStamp},
					update_text: {key: 'comment'},
                    posttime: { formatter: util.formatTimeStamp },
                    upload_time:{ formatter: util.formatTimeStamp },
                    upload_user:''
				})
			});
		}
	} catch (e) {
		logger.error('[PatchController.serverPatchList]:', e, ctx);
		ctx.makeErrResObj(500, e.toString());
	}
};
PatchController.serverNowList = async(ctx) => {
    let params = ctx.paramsObj;
    try {
        if (!await AuthService.hasOpeAuth(params.application, params.serverName, ctx.uid)) {
            ctx.makeNotAuthResObj();
        } else {
            let ret = await ServerService.getServerConfList4Tree({
                application: params.application,
                serverName: params.serverName,
                enableSet: params.enableSet ? 'Y' : 'N',
                setName: params.setName,
                setArea: params.setArea,
                setGroup: params.setGroup,
                nodeName: params.nodeName
            })
            ctx.makeResObj(200, '', util.viewFilter(ret, {
                application: '',
                server_name: '',
                node_name: '',
                patch_version: ''
            }));
        }
    } catch (e) {
        logger.error('[PatchController.serverNowList]:', e, ctx);
        ctx.makeErrResObj(500, e.toString());
    }
};

PatchController.getServerPatchByTaskId = async (ctx) => {
	let {task_id} = ctx.paramsObj;
	try {
		let ret = await CompileService.getServerPatchByTaskId(task_id);
		ctx.makeResObj(200, '', util.viewFilter(ret, {
			id: '',
			server: '',
			tgz: '',
			update_text: {key: 'comment'},
			posttime: {formatter: util.formatTimeStamp}
		}));
	} catch (e) {
		logger.error('[PatchController.getServerPatchByTaskId]:', e, ctx);
		ctx.makeErrResObj(500, e.toString());
	}
};

PatchController.getTagList = async (ctx) => {
	let {application, server_name} = ctx.paramsObj;
	try {
		if (!await AuthService.hasOpeAuth(application, server_name, ctx.uid)) {
			ctx.makeNotAuthResObj();
		} else {
			let list = await CompileService.getTagList(application, server_name);
			ctx.makeResObj(200, '', util.viewFilter(list, {path: '', version: '', commitMessage: ''}));
		}
	} catch (e) {
		logger.error('[PatchController.getTagList]:', e, ctx);
		ctx.makeErrResObj(500, e.toString());
	}
};

PatchController.getCompilerConf = (ctx) => {
	try {
		ctx.makeResObj(200, '', CompileService.getCompilerConf());
	} catch (e) {
		logger.error('[PatchController.getCompilerConf]:', e, ctx);
		ctx.makeErrResObj(500, e.toString());
	}
};

PatchController.getCodeInfConf = async (ctx) => {
	let {application, server_name} = ctx.paramsObj;
	try {
		if (!await AuthService.hasOpeAuth(application, server_name, ctx.uid)) {
			ctx.makeNotAuthResObj();
		} else {
			let ret = await CompileService.getCodeInfConf(application, server_name);
			ctx.makeResObj(200, '', ret);
		}
	} catch (e) {
		logger.error('[PatchController.getCodeInfConf]:', e, ctx);
		ctx.makeErrResObj(500, e.toString());
	}
};

PatchController.setCodeInfConf = async (ctx) => {
	let {application, server_name, path} = ctx.paramsObj;
	try {
		let ret = await CompileService.setCodeInfConf({application, server_name, path});
		ctx.makeResObj(200, '', ret);
	} catch (e) {
		logger.error('[PatchController.setCodeInfConf]:', e, ctx);
		ctx.makeErrResObj(500, e.toString());
	}
};

PatchController.doCompile = async (ctx) => {
	let {application, server_name, node, path, version, comment, compileUrl} = ctx.paramsObj;
	try {
		if (!await AuthService.hasDevAuth(application, server_name, ctx.uid)) {
			ctx.makeNotAuthResObj();
		} else {
			let ret = await CompileService.doCompile({application, server_name, node, path, version, comment, compileUrl});
			ctx.makeResObj(200, '', ret);
		}
	} catch (e) {
		logger.error('[PatchController.doCompile]:', e, ctx);
		ctx.makeErrResObj(500, e.toString());
	}
};

PatchController.compilerTask = async (ctx) => {
	let {taskNo} = ctx.paramsObj;
	try {
		let ret = await CompileService.compilerTask(taskNo);
		ctx.makeResObj(200, '', ret);
	} catch (e) {
		logger.error('[PatchController.compilerTask]:', e, ctx);
		ctx.makeErrResObj(500, e.toString());
	}
};

PatchController.downloadPackage = async (ctx) => {
	let { id } = ctx.paramsObj;
	try {

		let patch = await PatchService.find({ where: { id: id } });
		if (patch) {

			let fileUrl = path.join(WebConf.pkgUploadPath.path, patch.server.split('.')[0], patch.server.split('.')[1], patch.tgz);

			ctx.set('Content-Type', 'application/octet-stream');
			ctx.set('Content-Disposition', 'attachment; filename=' + patch.tgz),
				ctx.body = fs.createReadStream(fileUrl);
		}
	} catch (e) {
		logger.error('[PatchController.downloadPackage]:', e, ctx);
		ctx.makeErrResObj(500, e.toString());
	}
}

PatchController.deletePatchPackage = async (ctx) => {
	let {id} = ctx.paramsObj;
	try {

        let patch = await PatchService.find({ where: { id: id } });
        // console.log(patch);
        if (patch) {
            logger.info('deletePatchPackage:' + id + ", " + patch.server.split('.')[0] + ", " + patch.server.split('.')[1] + ", " + patch.tgz);

			await AdminService.deletePatchFile(patch.server.split('.')[0], patch.server.split('.')[1], patch.tgz);

			await PatchService.deleteServerPatchById(id);
		} 

		ctx.makeResObj(200, '', {});

	}catch (e) {
		logger.error('[PatchController.deletePatchPackage]:', e, ctx);
		ctx.makeErrResObj(500, e.toString());
	}
};

PatchController.setPatchPackageDefault = async (ctx) => {
	let {id, application, module_name, package_type} = ctx.paramsObj;
	try {
		let ret = await PatchService.setPatchPackageDefault({id, application, module_name, package_type});
		ctx.makeResObj(200, '', ret);
	} catch (e) {
		logger.error('[PatchController.setPatchPackageDefault]:', e, ctx);
		ctx.makeErrResObj(500, e.toString());
	}
};

PatchController.hasDcachePatchPackage = async (ctx) => {
	try {
		let ret = await PatchService.hasDcachePatchPackage();
		ctx.makeResObj(200, '', ret);
	} catch (e) {
		logger.error('[PatchController.hasDcachePatchPackage]:', e, ctx);
		ctx.makeErrResObj(500, e.toString());
	}
};


module.exports = PatchController;
