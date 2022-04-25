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

const logger = require('../../../logger');
const WebConf = require('../../../config/webConf');
const util = require('../../../tools/util');
const fs = require('fs-extra');
const TarsParser = require('../../service/infTest/TarsParser/TarsParser');
const InfTestBaseService = require('../../service/infTest/InfTestBaseService');

const {
	exec
} = require('child_process');

const InfTestController = {};

let AuthService;

if (WebConf.isEnableK8s()) {
	AuthService = require('../../../k8s/service/auth/AuthService');
} else {
	AuthService = require('../../../app/service/auth/AuthService');
}

let k8sService = null;
let nativeService = null;

let getInfTestService = (k8s) => {
	if (WebConf.isEnableK8s() && (k8s == true || k8s == "true")) {
		if (!k8sService) {
			const InfTestK8SService = require('../../service/infTest/InfTestK8SService');
			InfTestBaseService.prototype = new InfTestK8SService();
			k8sService = new InfTestBaseService();
		}

		return k8sService;
	} else {
		if (!nativeService) {
			const InfTestNativeService = require('../../service/infTest/InfTestNativeService');
			InfTestBaseService.prototype = new InfTestNativeService();
			nativeService = new InfTestBaseService();
		}
		return nativeService;
	}
}

////////////////////////////////////////////////////////////////////////////////
let tars2case = WebConf.infTestConf.tool;

const hasCaseTool = async () => {
	return fs.existsSync(tars2case);
}

exec("chmod +x " + tars2case, {
	cwd: __dirname
})

async function getBenchmarkContext(tarsFilePath) {
	return await new Promise((resolve, reject) => {
		exec(`${tars2case} --web ${tarsFilePath}`, {
			cwd: __dirname
		}, (error, stdout) => {
			if (error) {
				reject(error)
				return
			}
			resolve(stdout)
		})
	})
}
async function getContext(tarsFilePath) {
	const content = await fs.readFile(tarsFilePath);
	const fileDir = tarsFilePath.split(/[/\\]/).slice(0, -1).join('/');
	const parser = new TarsParser(fileDir);
	let context = {};
	parser.parseFile(context, content.toString());
	return context;
}

////////////////////////////////////////////////////////////////////////////////

function getRegistry(k8s) {

	let Tars;
	if (k8s && k8s == 'true') {
		Tars = require('../../../rpc/k8s').registry;

	} else {
		Tars = require('../../../rpc/index').registry;
	}

	return Tars;
}


InfTestController.interfaceDebug = async (ctx) => {
	try {
		let {
			id,
			k8s,
			objName,
			application,
			server_name,
			module_name,
			interface_name,
			function_name,
			params
		} = ctx.paramsObj;
		if (!await AuthService.hasDevAuth(application, server_name, ctx.uid)) {
			ctx.makeNotAuthResObj();
		} else {

			// let client = getRegistry(k8s);

			let rsp = await getInfTestService(k8s).debug({
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
	let {
		application,
		server_name,
		set_name,
		k8s
	} = ctx.paramsObj;
	// tars文件上传目录，和发布包同一个根目录
	let baseUploadPath = WebConf.pkgUploadPath.path;
	let tarsFilePath = `${baseUploadPath}/tars_files/${application}/${server_name}`;
	try {
		await fs.ensureDirSync(tarsFilePath);
		if (!await AuthService.hasOpeAuth(application, server_name, ctx.uid)) {
			ctx.makeNotAuthResObj();
		} else {
			let files = ctx.req.files;
			if (!files.length) {
				logger.error('[uploadTarsFile]:', 'no files', files);
				throw new Error('[uploadTarsFile]: no files');
			}
			// 检查文件类型并重命名文件
			for (let file of files) {
				if (!(/\.tars$/gi.test(file.originalname) && file.mimetype === 'application/octet-stream')) {
					logger.error('[uploadTarsFile]:', 'only accept .tars files', ctx);
					ctx.makeResObj(500, "#pub.dlg.filetype#");
					return;

				}
				await fs.rename(`${baseUploadPath}/${file.filename}`, `${tarsFilePath}/${file.originalname}`);
			}

			let exists = await hasCaseTool();

			if (!exists) {
				ctx.makeResObj(500, "#inf.error.caseToolNotExists#");
				return;
			}
			// 解析并入库
			let ret = [];
			for (let file of files) {
				const context = await getContext(`${tarsFilePath}/${file.originalname}`);
				const benchmark_context = await getBenchmarkContext(`${tarsFilePath}/${file.originalname}`);
				ret.push(await getInfTestService(k8s).addTarsFile({
					application: application,
					server_name: server_name,
					file_name: file.originalname,
					context: JSON.stringify(context),
					benchmark_context: benchmark_context,
					posttime: new Date()
				}));
			}
			ctx.makeResObj(200, '', ret);
		}
	} catch (e) {
		logger.error('[uploadTarsFile]:', e, ctx);
		ctx.makeResObj(500, e.toString() || "#inf.error.parseFail#");
		// ctx.makeResObj(500, "#inf.error.parseFail#");
	} finally {
		// 删除重命名后的文件
		//fs.remove(`${tarsFilePath}`);
	}
}

InfTestController.getFileList = async (ctx) => {
	try {
		let {
			application,
			server_name,
			k8s
		} = ctx.paramsObj;
		if (!await AuthService.hasOpeAuth(application, server_name, ctx.uid)) {
			ctx.makeNotAuthResObj();
		} else {
			let ret = await getInfTestService(k8s).getTarsFile({
				application: application,
				server_name: server_name
			}, ['f_id', 'application', 'server_name', 'file_name', 'posttime']);
			ctx.makeResObj(200, '', util.viewFilter(ret, {
				f_id: '',
				application: '',
				server_name: '',
				file_name: '',
				posttime: {
					formatter: util.formatTimeStamp
				}
			}));
		}
	} catch (e) {
		logger.error('[getFileList]:', e, ctx);
		ctx.makeErrResObj();
	}
}

InfTestController.getContexts = async (ctx) => {
	try {
		let {
			id,
			application,
			server_name,
			type,
			module_name,
			interface_name,
			k8s
		} = ctx.paramsObj;
		if (!await AuthService.hasOpeAuth(application, server_name, ctx.uid)) {
			ctx.makeNotAuthResObj();
		} else {
			let contexts;
			if (type == 'all') {
				contexts = await getInfTestService(k8s).getAllData(id);
			} else if (type == 'module') {
				contexts = await getInfTestService(k8s).getModuleData(id);
			} else if (type == 'interface') {
				contexts = await getInfTestService(k8s).getInterfaceData(id, module_name);
			} else if (type == 'function') {
				contexts = await getInfTestService(k8s).getFunctionData(id, module_name, interface_name);
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
		let {
			application,
			server_name,
			id,
			module_name,
			interface_name,
			function_name,
			k8s
		} = ctx.paramsObj;
		if (!await AuthService.hasOpeAuth(application, server_name, ctx.uid)) {
			ctx.makeNotAuthResObj();
		} else {
			let params = await getInfTestService(k8s).getParams(id, module_name, interface_name, function_name);
			ctx.makeResObj(200, '', params);
		}
	} catch (e) {
		logger.error('[getContexts]:', e, ctx);
		ctx.makeErrResObj();
	}
}

InfTestController.deleteTarsFile = async (ctx) => {
	try {
		let {
			id,
			k8s
		} = ctx.paramsObj;
		ctx.makeResObj(200, '', await getInfTestService(k8s).deleteTarsFile(id));
	} catch (e) {
		logger.error('[deleteTarsFile]:', e, ctx);
		ctx.makeErrResObj();
	}
}

InfTestController.getStructs = async (ctx) => {
	try {
		let {
			id,
			module_name,
			k8s
		} = ctx.paramsObj;
		let ret = await getInfTestService(k8s).getStructs(id, module_name);
		ctx.makeResObj(200, '', ret);
	} catch (e) {
		logger.error('[deleteTarsFile]:', e, ctx);
		ctx.makeErrResObj();
	}
}

InfTestController.getBenchmarkDes = async (ctx) => {
	try {
		let {
			id,
			k8s
		} = ctx.paramsObj;
		let ret = await getInfTestService(k8s).getBenchmarkDes(id);
		ctx.makeResObj(200, '', ret);
	} catch (e) {
		logger.error('[getBenchmarkDes]:', e, ctx);
		ctx.makeErrResObj();
	}
}
InfTestController.getBmCaseList = async (ctx) => {
	try {
		let {
			servant,
			fn,
			k8s
		} = ctx.paramsObj;
		let [application, server_name] = servant.split(".")
		if (!await AuthService.hasOpeAuth(application, server_name, ctx.uid)) {
			ctx.makeNotAuthResObj();
			return;
		}
		let ret = await getInfTestService(k8s).getBmCaseList(servant, fn);
		ctx.makeResObj(200, '', ret);
	} catch (e) {
		logger.error('[getBmCaseList]:', e, ctx);
		ctx.makeErrResObj();
	}
}

InfTestController.getBmResultById = async (ctx) => {
	try {
		let {
			id,
			k8s
		} = ctx.paramsObj;
		let ret = await getInfTestService(k8s).getBmResultById(id);
		console.log(ret);

		let [application, server_name] = ret.servant.split(".")
		if (!await AuthService.hasOpeAuth(application, server_name, ctx.uid)) {
			ctx.makeNotAuthResObj();
			return;
		}
		ctx.makeResObj(200, '', ret);
	} catch (e) {
		logger.error('[getBmResultById]:', e, ctx);
		ctx.makeErrResObj();
	}
}

InfTestController.upsertBmCase = async (ctx) => {
	try {
		let {
			k8s
		} = ctx.paramsObj;

		let fields = ["id", "servant", "fn", "des", "in_values", "endpoints", "links", "speed", "duration", "is_deleted"],
			caseInfo = {}
		fields.forEach((field) => {
			if (field in ctx.paramsObj) caseInfo[field] = ctx.paramsObj[field]
		})
		let [application, server_name] = caseInfo.servant.split(".")
		if (!await AuthService.hasDevAuth(application, server_name, ctx.uid)) {
			ctx.makeNotAuthResObj();
			return;
		}
		let ret = await getInfTestService(k8s).upsertBmCase(caseInfo);
		ctx.makeResObj(200, '', ret);
	} catch (e) {
		logger.error('[upsertBmCase]:', e, ctx);
		ctx.makeErrResObj();
	}
}

InfTestController.deleteBmCase = async (ctx) => {
	try {
		let {
			k8s,
			id,
			servant
		} = ctx.paramsObj;

		let [application, server_name] = servant.split(".")
		if (!await AuthService.hasDevAuth(application, server_name, ctx.uid)) {
			ctx.makeNotAuthResObj();
			return;
		}
		let ret = await getInfTestService(k8s).deleteBmCase(id, servant);
		ctx.makeResObj(200, '', ret);
	} catch (e) {
		logger.error('[upsertBmCase]:', e, ctx);
		ctx.makeErrResObj();
	}
}

InfTestController.startBenchmark = async (ctx) => {
	try {
		let {
			servant,
			k8s
		} = ctx.paramsObj
		let [application, server_name] = servant.split(".")
		if (!await AuthService.hasDevAuth(application, server_name, ctx.uid)) {
			ctx.makeNotAuthResObj();
			return;
		}
		ctx.paramsObj.owner = ctx.uid
		let ret = await getInfTestService(k8s).startBenchmark(ctx.paramsObj);
		ctx.makeResObj(200, '', ret);
	} catch (e) {
		logger.error('[startBenchmark]:', e, ctx);
		ctx.makeResObj(400, e.message);
	}
}

InfTestController.stopBenchmark = async (ctx) => {
	try {
		let {
			servant,
			k8s
		} = ctx.paramsObj
		let [application, server_name] = servant.split(".")
		if (!await AuthService.hasDevAuth(application, server_name, ctx.uid)) {
			ctx.makeNotAuthResObj();
			return;
		}
		ctx.paramsObj.owner = ctx.uid
		let ret = await getInfTestService(k8s).stopBenchmark(ctx.paramsObj);
		ctx.makeResObj(200, '', ret);
	} catch (e) {
		logger.error('[stopBenchmark]:', e, ctx);
		ctx.makeResObj(400, e.message);
	}
}

InfTestController.testBenchmark = async (ctx) => {
	try {
		let {
			servant,
			k8s
		} = ctx.paramsObj
		let [application, server_name] = servant.split(".")
		if (!await AuthService.hasDevAuth(application, server_name, ctx.uid)) {
			ctx.makeNotAuthResObj();
			return;
		}
		ctx.paramsObj.owner = ctx.uid
		let ret = await getInfTestService(k8s).testBenchmark(ctx.paramsObj);
		ctx.makeResObj(200, '', ret);
	} catch (e) {
		logger.error('[testBenchmark]:', e, ctx);
		ctx.makeResObj(400, e.message);
	}
}

InfTestController.getEndpoints = async (ctx) => {
	try {
		let {
			servant,
			k8s
		} = ctx.paramsObj
		let [application, server_name] = servant.split(".")
		if (!await AuthService.hasOpeAuth(application, server_name, ctx.uid)) {
			ctx.makeNotAuthResObj();
			return;
		}

		let rst = await getRegistry(k8s).findObjectById(servant);
		// let ret = await AdminService.getEndpoints(servant);
		ctx.makeResObj(200, '', rst.response.return.value);
	} catch (e) {
		logger.error('[getEndpoints]:', e, ctx);
		ctx.makeResObj(500, "get endpoints error");
	}
}

InfTestController.isBenchmarkInstalled = async (ctx) => {
	try {
		// let adminObj = WebConf.infTestConf.benchmarkAdmin;
		let k8s = ctx.paramsObj.k8s;

		// console.log(adminObj, k8s);

		// let rst = getBenchmark(k8s).tars_ping();

		let rst = await getRegistry(k8s).findObjectById(WebConf.infTestConf.benchmarkAdmin);
		let ret = rst.response.return.value;
		if (ret && ret.length) {
			ctx.makeResObj(200, '', true);
		} else {
			ctx.makeResObj(200, '', false);
		}
	} catch (e) {
		logger.error('[isBenchmarkInstalled]:', e.message);
		// ctx.makeResObj(500, 'get benchmark admin status error', false);
		ctx.makeResObj(200, '', true);
	}
}


const testCaseConfStruct = {
	case_id: '',
	f_id: '',
	test_case_name: '',
	application: '',
	server_name: '',
	object_name: '',
	file_name: '',
	module_name: '',
	interface_name: '',
	function_name: '',
	posttime: {
		formatter: util.formatTimeStamp
	},
	context: "",
	modify_user: ""
};


InfTestController.getTestCaseList = async (ctx) => {
	const {
		f_id,
		k8s,
		application,
		server_name,
		module_name,
		interface_name,
		function_name
	} = ctx.paramsObj;
	try {

		if (!await AuthService.hasDevAuth(application, server_name, ctx.uid)) {
			ctx.makeNotAuthResObj();
		} else {
			let rst = null;
			// 精准匹配
			if (module_name && interface_name && function_name) {
				rst = await getInfTestService(k8s).getTestCaseList({
					f_id: f_id,
					module_name: module_name,
					interface_name: interface_name,
					function_name: function_name
				});
			} else {
				rst = await getInfTestService(k8s).getTestCaseList({
					f_id: f_id
				});
			}
			ctx.makeResObj(200, '', {
				count: rst.count,
				rows: util.viewFilter(rst.rows, testCaseConfStruct)
			});
		}

	} catch (e) {
		logger.error('[getTestCaseList]', e, ctx);
		ctx.makeErrResObj();
	}
}

InfTestController.interfaceAddCase = async (ctx) => {
	try {
		const {
			f_id,
			k8s,
			test_case_name,
			objName,
			file_name,
			application,
			server_name,
			module_name,
			interface_name,
			function_name,
			params
		} = ctx.paramsObj;
		if (!await AuthService.hasDevAuth(application, server_name, ctx.uid)) {
			ctx.makeNotAuthResObj();
		} else {
			let ret = await getInfTestService(k8s).addTestCase({
				f_id: f_id,
				test_case_name: test_case_name,
				application: application,
				server_name: server_name,
				object_name: objName,
				file_name: file_name,
				module_name: module_name,
				interface_name: interface_name,
				function_name: function_name,
				context: params,
				posttime: new Date(),
				modify_user: ctx.uid
			});
			ctx.makeResObj(200, '', ret);
		}
	} catch (e) {
		logger.error('[interfaceAddCase]:', e, ctx);
		ctx.makeErrResObj();
	}
}


InfTestController.deleteTestCase = async (ctx) => {
	try {
		let {
			case_id,
			k8s
		} = ctx.paramsObj;
		ctx.makeResObj(200, '', await getInfTestService(k8s).deleteTestCase(case_id));
	} catch (e) {
		logger.error('[deleteTestCase]:', e, ctx);
		ctx.makeErrResObj();
	}
}

InfTestController.modifyTestCase = async (ctx) => {
	try {
		const {
			case_id,
			k8s,
			test_case_name,
			params,
			prior_set
		} = ctx.paramsObj;
		ctx.makeResObj(200, '', await getInfTestService(k8s).modifyTestCase(case_id, test_case_name, params, ctx.uid));
	} catch (e) {
		logger.error('[modifyTestCase]:', e, ctx);
		ctx.makeErrResObj();
	}
}

module.exports = InfTestController;