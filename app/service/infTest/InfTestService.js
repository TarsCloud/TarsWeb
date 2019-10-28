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
const TarsClient = require('./TarsClient');
const TarsParser = require('./TarsParser/TarsParser');
const InfTestDao = require('../../dao/InfTestDao');

const fs = require('fs-extra');

const InfTestService = {};

/**
 * @name debug 发起调试
 * @param {Object} paramObj
 * @description paramObj {
 * id   tars文件ID
 * moduleName   模块名
 * interfaceName    接口名
 * objName  OBJ名
 * functionName 方法名
 * params   参数
 * }
 * @returns {Object} res 服务返回的数据
 */
InfTestService.debug = async (paramObj) => {
	let context = await getContextFromDB(paramObj.id);
	context = JSON.parse(context.context);
	let interface = context[paramObj.moduleName].interfaces[paramObj.interfaceName];
	let client = new TarsClient(context, interface, paramObj.objName);
	let ret = await client.invoke(paramObj.functionName, JSON.parse(paramObj.params));
	return ret.response;
}

/**
 * @name addTarsFile 将解析后的tars文件插入数据库
 * @param {Object} params
 * @returns {Object} 插入的记录
 */
InfTestService.addTarsFile = async (params) => {
	await InfTestDao.addTarsFile(params);
	delete params.context;
	delete params.posttime;
	return (await InfTestService.getTarsFile(params, ['f_id', 'application', 'server_name', 'file_name', 'posttime']))[0];
}

/**
 * @name getTarsFile 获取解析后的tars文件记录
 * @param {Object} params
 * @param {Array} fields
 * @returns {Object} 插入的记录
 */
InfTestService.getTarsFile = async (params, fields) => {
	return await InfTestDao.getTarsFile(params, fields);
}

/**
 * @name getContext 根据tars文件解析上下文
 * @param {String} tarsFilePath
 * @returns {Object} context上下文
 */
InfTestService.getContext = (tarsFilePath) => {
	return getContext(tarsFilePath);
}

async function getContext(tarsFilePath) {
	const content = await fs.readFile(tarsFilePath);
	const fileDir = tarsFilePath.split(/[/\\]/).slice(0, -1).join('/');
	const parser = new TarsParser(fileDir);
	let context = {};
	parser.parseFile(context, content.toString());
	return context;
}

async function getContextFromDB(id) {
	return await InfTestDao.getContext(id);
}

/**
 * @name getAllData 将上下文解析成多层的模块接口方法嵌套JSON
 * @param {String} id tars文件ID
 * @returns {Object} context
 */
InfTestService.getAllData = async (id) => {
	let context = (await getContextFromDB(id)).context;
	context = JSON.parse(context);
	function f(context) {
		let obj = [];
		for (let item in context) {
			if (item == 'includes') continue;
			let tmp = {
				value: item,
				label: item
			};
			if (!context[item] || JSON.stringify(context[item]) == '{}') continue;
			let children = [];
			for (let i in context[item]) {
				if (i == 'interfaces' || i == 'functions') {
					children = f(context[item][i]);
				}
			}
			if (children.length) {
				Object.assign(tmp, {children: children});
			}
			obj.push(tmp);
		}
		return obj;
	}

	return f(context);
}

/**
 * @name getStruct  获取上下文的enums,keys,struct,string等结构数据
 * @param {String} id tars文件ID
 * @param {String} moduleName 模块名
 * @returns {Object} structs
 */
InfTestService.getStructs = async (id, moduleName) => {
	let context = (await getContextFromDB(id)).context;
	context = JSON.parse(context);
	context = context[moduleName];
	let obj = {};
	for (let item in context) {
		if (item != 'interfaces') {
			obj[item] = context[item];
		}
	}
	return obj;
}

/**
 * @name getModuleData 获取所有模块
 * @param {String} id tars文件ID
 * @returns {Array} keys 模块
 */
InfTestService.getModuleData = async (id) => {
	let context = (await getContextFromDB(id)).context;
	context = JSON.parse(context);
	let keys = Object.keys(context).filter(item => item != 'includes');
	return keys;
}

/**
 * @name getInterfaceData 获取所有接口
 * @param {String} id tars文件ID
 * @param {String} moduleName 模块名
 * @returns {Array} keys 接口
 */
InfTestService.getInterfaceData = async (id, moduleName) => {
	let context = (await getContextFromDB(id)).context;
	context = JSON.parse(context);
	let keys = Object.keys(context[moduleName].interfaces);
	return keys;
}

/**
 * @name getFunctionData 获取所有方法
 * @param {String} id tars文件ID
 * @param {String} moduleName 模块名
 * @param {String} interfaceName 接口名
 * @returns {Array} keys 方法
 */
InfTestService.getFunctionData = async (id, moduleName, interfaceName) => {
	let context = (await getContextFromDB(id)).context;
	context = JSON.parse(context);
	return Object.keys(context[moduleName].interfaces[interfaceName].functions);
}

/**
 * @name getParams 获取所有参数
 * @param {String} id tars文件ID
 * @param {String} moduleName 模块名
 * @param {String} interfaceName 接口名
 * @param {String} functionName 方法名
 * @returns {Array} params 参数
 */
InfTestService.getParams = async (id, moduleName, interfaceName, functionName) => {
	let context = (await getContextFromDB(id)).context;
	context = JSON.parse(context);
	let params = context[moduleName].interfaces[interfaceName].functions[functionName].params;
	return params;
}

/**
 * 从DB删除解析后的tars文件
 * @param {String} id tars文件ID
 * @returns {Number} 删除的记录数
 */
InfTestService.deleteTarsFile = async (id) => {
	return await InfTestDao.deleteTarsFile(id);
}

module.exports = InfTestService;