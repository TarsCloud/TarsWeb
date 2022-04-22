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
// const TarsParser = require('./TarsParser/TarsParser');
// const {
// 	benchmarkPrx,
// 	benchmarkStruct
// } = require('../../../rpc');
const {
	BenchmarkRunner
} = require("./BenchmarkK8SRunner");

const CommonService = require('../../../k8s/service/common/CommonService');
const TemplateService = require("../../../k8s/service/template/TemplateService");
const {
	hash
} = require('winston/lib/winston/common');
// const InfTestDao = require('../../../app/dao/InfTestDao');
// const TestCaseDao = require('../../../app/dao/TestCaseDao');

// const fs = require('fs-extra');

const InfTestService = {};

const getEs = async (index) => {
	let esConfig = await TemplateService.getEsConfig();

	let idx = esConfig.tars.elk.index["index"] || (CommonService.NAMESPACE + "_" + index);

	let esNodes = Object.keys(esConfig.tars.elk.nodes)[0].split(",");
	return {
		protocol: esConfig.tars.protocol,
		es: esNodes[0],
		index: idx
	}
}

const createIndex = async (index) => {
	let create = {
		settings: {
			index: {
				number_of_shards: 3,
				number_of_replicas: 2
			}
		}
	};

	let es = await getEs(index);

	try {
		let res = await CommonService.request(es.protocol, es.es, `${es.index}`, create, "put");

		console.log(res);
	} catch (e) {
		console.log("createIndex:", e.message);
	}
}

// createIndex("test_inf");

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
	let client = new TarsClient(context, paramObj.client, interface, paramObj.objName);
	let ret = await client.invoke(paramObj.functionName, JSON.parse(paramObj.params));
	if (ret && ret.response) return ret.response;
	return ret;
}

/**
 * @name addTarsFile 将解析后的tars文件插入数据库
 * @param {Object} params
 * @returns {Object} 插入的记录
 */
InfTestService.addTarsFile = async (params) => {

	// console.log(params);

	await createIndex("test_inf");

	let f_id = hash(params.application + "-" + params.server_name + "-" + params.server_name);
	let update = {
		doc: {
			f_id: f_id,
			application: params.application,
			server_name: params.server_name,
			file_name: params.file_name,
			context: params.context,
			benchmark_context: params.benchmark_context,
			posttime: params.posttime
		},
		doc_as_upsert: true
	};

	console.log(update.doc);

	let es = await getEs("test_inf");

	await CommonService.request(es.protocol, es.es, `${es.index}/_update/${f_id}`, update);

	// await InfTestDao.addTarsFile(params);
	delete params.context;
	delete params.benchmark_context;
	delete params.posttime;

	return params;
	// return (await InfTestService.getTarsFile(params, ['f_id', 'application', 'server_name', 'file_name', 'posttime']))[0];
}

/**
 * @name getTarsFile 获取解析后的tars文件记录
 * @param {Object} params
 * @param {Array} fields
 * @returns {Object} 插入的记录
 */
InfTestService.getTarsFile = async (params, fields) => {

	let search = {
		query: {
			bool: {
				must: [{
					match: {
						application: params.application
					}
				}, {
					match: {
						server_name: params.server_name
					}
				}]
			}
		},
	};

	// console.log(search);

	let es = await getEs("test_inf");
	let res;
	try {
		res = await CommonService.request(es.protocol, es.es, `${es.index}/_search`, search);
		// console.log(res.hits.hits);
	} catch (e) {
		if (e.response.body.status == 404) {
			return [];
		}
		throw e;
	}

	let hits = [];
	res.hits.hits.forEach(hit => {
		hits.push(hit._source);
	});
	return hits;
	// return await InfTestDao.getTarsFile(params, fields);
}

async function getContextFromDB(id) {
	let search = {
		query: {
			match: {
				f_id: id
			}
		}
	};

	let es = await getEs("test_inf");

	let res = await CommonService.request(es.protocol, es.es, `${es.index}/_search`, search);

	console.log(res);
	let hits = [];
	res.hits.hits.forEach(hit => {
		hits.push(hit._source);
	});
	return hits[0];

	// return await InfTestDao.getContext(id);
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
				Object.assign(tmp, {
					children: children
				});
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

	let search = {
		query: {
			match: {
				id: id
			}
		}
	};
	let es = await getEs("test_inf");

	let res = await CommonService.request(es.protocol, es.es, `${es.index}/_delete_my_query`, search);

	return res;

	// return await InfTestDao.deleteTarsFile(id);
}

function genFieldDes(context, field) {
	let type = field.type
	if (typeof type == "string") return type
	//enum
	if (type.isEnum) return "int"
	//结构体
	if (type.isStruct) {
		let fielddes = []
		let fields = context[type.module].structs[type.name].fields
		for (let fieldName in fields) {
			fielddes.push(genFieldDes(context, fields[fieldName]))
		}
		return `struct<${fielddes.join(", ")}>`
	}
	//map
	if (type.map) {
		return `map<${genFieldDes(context, {type: type.key})}, ${genFieldDes(context, {type: type.value})}>`
	}
	//list
	if (type.vector) {
		return `vector<${genFieldDes(context, {type: type.type})}>`
	}
	throw new Error(`unknown field type:${JSON.stringify(field)}`)

}
/**
 * 获取所有的benchmark描述数据
 * @param {String} id tars文件ID
 * @returns {Array} benchmark函数描述
 */
InfTestService.getBenchmarkDes = async (id) => {
	let tarsfile = await getContextFromDB(id)
	let context = tarsfile.context,
		benchmark_context = tarsfile.benchmark_context
	context = JSON.parse(context)
	benchmark_context = JSON.parse(benchmark_context || "{}")
	let fnlist = []
	for (let moduleName in context) {
		let moduleObj = context[moduleName]
		for (let interfaceName in moduleObj.interfaces) {
			let interfaceObj = moduleObj.interfaces[interfaceName]
			for (let fnName in interfaceObj.functions) {
				let fnObj = interfaceObj.functions[fnName]
				let fnBmContext = benchmark_context[fnName]
				fnlist.push({
					module: moduleName,
					interface: interfaceName,
					name: fnName,
					return: fnBmContext ? fnBmContext.rettype : genFieldDes(context, {
						type: fnObj.return
					}),
					inParams: fnBmContext ? JSON.stringify(fnBmContext.descinput) : fnObj.params.filter((param) => {
						return !param.out
					}).map((param) => {
						return genFieldDes(context, param)
					}).join("|"),
					outParams: fnBmContext ? JSON.stringify(fnBmContext.descoutput) : fnObj.params.filter((param) => {
						return param.out
					}).map((param) => {
						return genFieldDes(context, param)
					}).join("|"),
					funInput: fnBmContext ? JSON.stringify(fnBmContext.funinput, null, 2) : ""
				})
			}
		}
	}
	return fnlist
}

InfTestService.getBmCaseList = async (servant, fn) => {
	let search = {
		query: {
			match: {
				servant: servant,
				fn: fn,
				is_deleted: 0
			}
		}
	};

	let es = await getEs("bm_case");

	let res = await CommonService.request(es.protocol, es.es, `${es.index}/_search`, search);

	console.log(res);

	return res.hits;

	// return await InfTestDao.getBmCaseList(servant, fn)
}

//resultMap  
const RET_MAP = {
	"0": "SUCCESS",
	"-1": "EXCEPTION",
	"-101": "INIT_PARAM_ERROR",
	"-102": "URL_ERROR",
	"-1001": "PACKET_ENCODE_ERROR",
	"-1002": "PACKET_DECODE_ERROR",
	"-1003": "PACKET_PARAM_ERROR",
	"-2000": "SOCK_ERROR",
	"-2001": "SOCK_INVALID",
	"-2003": "SOCK_CONN_ERROR",
	"-2004": "SOCK_CONN_TIMEOUT",
	"-2005": "SOCK_SEND_ERROR",
	"-2006": "SOCK_RECV_ERROR",
	"-2007": "SOCK_RECV_TIMEOUT"
}

const COST_MAP = {
	"0": "0~10ms",
	"1": "10~30ms",
	"2": "30~50ms",
	"3": "50~100ms",
	"4": "100~500ms",
	"5": "0.5~3s",
	"6": "3~5s",
	"7": "5~100s"
}

InfTestService.getBmResultById = async (id) => {

	let search = {
		query: {
			match: {
				id: id,
			}
		}
	};

	let es = await getEs("test_inf");

	let row = await CommonService.request(es.protocol, es.es, `${es.index}/_search`, search);


	// let row = await InfTestDao.getBmResultById(id)

	if (row.results) {
		let results = JSON.parse(row.results)
		results.map((item) => {
			let mappedCost = {},
				mappedRet = {}
			for (let key in item.cost_map) {
				if (COST_MAP[key]) mappedCost[COST_MAP[key]] = item.cost_map[key]
			}
			for (let key in item.ret_map) {
				mappedRet[RET_MAP[key] || key] = item.ret_map[key]
			}
			item.cost_map = mappedCost
			item.ret_map = mappedRet
			return item
		})
		row.results = JSON.stringify(results)
	}
	return row
}

InfTestService.upsertBmCase = async (caseInfo) => {
	//状态更新为停止时，调用代理服务停止压测
	if (("status" in caseInfo) && caseInfo.status == 0) {

	}

	let update = {
		doc: caseInfo
	};

	let es = await getEs("test_inf");

	return await CommonService.request(es.protocol, es.es, `${es.index}/_update/${caseInfo.id}`, update);

	// return await InfTestDao.upsertBmCase(caseInfo)
}

InfTestService.startBencmark = async (runParams) => {
	return await new BenchmarkRunner(runParams).start()
}
InfTestService.stopBencmark = async (runParams) => {
	return await new BenchmarkRunner(runParams).stop()
}
InfTestService.testBencmark = async (runParams) => {
	return await new BenchmarkRunner(runParams).test()
}

/**
 * @name getTestCase 获取测试用例
 * @param {Object} params 
 * @param {Array} fields
 * @returns {Object} 测试用例 
 */
InfTestService.getTestCase = async (params, fields) => {
	let search = {
		query: {
			match: params
		}
	};

	let es = await getEs("test_case");

	let row = await CommonService.request(es.protocol, es.es, `${es.index}/_search`, search);

	return row.hits;
	// return await TestCaseDao.getTestCase(params, fields);
}


/**
 * @name addTestCase 将测试用例插入数据库
 * @param {Object} params 
 * @returns {Object} 插入的记录
 */
InfTestService.addTestCase = async (params) => {

	let update = {
		doc: params
	};

	let es = await getEs("test_case");

	await CommonService.request(es.protocol, es.es, `${es.index}/_update/${params.id}`, update);

	// await TestCaseDao.addTestCase(params);

	delete params.context;
	delete params.posttime;
	// return (await InfTestService.getTestCase(params, ['case_id', 'f_id', 'test_case_name', 'server_name', 'file_name', 'posttime', 'context', 'object_name', 'module_name', 'interface_name', 'function_name', 'posttime', 'modify_user']))[0];

	return params;
}


/**
 * @name getTestCaseList 获取测试用例列表
 * @param {String} params 匹配字段
 * @param {String} curPage 当前页
 * @param {String} pageSize 每页数据条数
 * @returns {Object} 测试用例列表
 */
InfTestService.getTestCaseList = async (params, curPage, pageSize) => {
	let search = {
		query: {
			bool: {
				must: [{
					match: {
						app: app
					}
				}]
			}
		},
		from: (curPage - 1) * curPage,
		size: curPage
	};
	let es = await getEs("test_case");

	let row = await CommonService.request(es.protocol, es.es, `${es.index}/_search`, search);

	return row.hits;

	// return await TestCaseDao.getTestCaseList(params, curPage, pageSize);
}


/**
 * @name deleteTestCase 从DB删除对应测试用例
 * @param {String} case_id 用例ID
 * @returns {Number} 删除的记录数
 */
InfTestService.deleteTestCase = async (case_id) => {
	let search = {
		query: {
			match: {
				case_id: case_id
			}
		}
	};
	let es = await getEs("test_case");

	let res = await CommonService.request(es.protocol, es.es, `${es.index}/_delete_my_query`, search);

	return res;

	// return await TestCaseDao.deleteTestCase(case_id);
}

/**
 * @name modifyTestCase 修改对应测试用例
 * @param {String} case_id 用例ID
 * @param {String} test_case_name 用例名字
 * @param {String} params 用例参数
 */
InfTestService.modifyTestCase = async (case_id, test_case_name, params, modify_user) => {
	let update = {
		doc: {
			case_id: case_id,
			test_case_name: test_case_name,
			params: params,
			modify_user: modify_user

		}
	};

	let es = await getEs("test_case");

	await CommonService.request(es.protocol, es.es, `${es.index}/_update/${case_id}`, update);

	// return await TestCaseDao.modifyTestCase(case_id, test_case_name, params, modify_user);
}

module.exports = InfTestService;