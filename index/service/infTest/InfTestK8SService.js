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

const CommonService = require('../../../k8s/service/common/CommonService');
const TemplateService = require("../../../k8s/service/template/TemplateService");
const {
	hash
} = require('winston/lib/winston/common');

let esConfig = null;

const getEs = async (index) => {
	if (!esConfig) {
		esConfig = await TemplateService.getEsConfig();
	}

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

//////////////////////////////////////////////////////////////////////////////////////
const RunnerCallback = {};

RunnerCallback.isBmCaseRunning = async (caseId, servant, fn) => {
	let search = {
		query: {
			bool: {
				must: [{
					match: {
						servant: servant
					}
				}, {
					match: {
						fn: fn
					}
				}, {
					match: {
						status: 1
					}
				}]
			}
		},
	};
	let es = await getEs("bm_case");

	let res = await CommonService.request(es.protocol, es.es, `${es.index}/_search`, search);

	if (res.hits.hits.length > 0) {

		if (!res.hits.hits[0]._source.posttime) {
			res.hits.hits[0]._source.posttime = 0;
		}
		//超过一分钟未更新，认为是server挂掉了，任务死在了运行状态，重置为未运行状态
		if (new Date().getTime() - new Date(res.hits.hits[0]._source.posttime).getTime() >= 60000) {

			let update = {
				doc: {
					id: res.hits.hits[0]._source.id,
					status: 0
				},
			};
			let es = await getEs("bm_case");

			await CommonService.request(es.protocol, es.es, `${es.index}/_update/${res.hits.hits[0]._source.id}`, update);

			return false;
		}

		return true;
	}

	return false;
}

RunnerCallback.startBenchmark = async (id) => {

	let update = {
		doc: {
			id: id,
			posttime: new Date(),
			status: 1
		},
	};

	// console.log();
	let es = await getEs("bm_case");

	await CommonService.request(es.protocol, es.es, `${es.index}/_update/${id}`, update);
}

RunnerCallback.stopBenchmark = async (id) => {
	let update = {
		doc: {
			id: id,
			status: 0
		},
	};
	let es = await getEs("bm_case");

	console.log("stopBenchmark", id);

	await CommonService.request(es.protocol, es.es, `${es.index}/_update/${id}`, update);
}

RunnerCallback.clearBenchmarkResult = async (id) => {
	let update = {
		doc: {
			id: id,
			results: ""
		},
	};
	let es = await getEs("bm_case");

	await CommonService.request(es.protocol, es.es, `${es.index}/_update/${id}`, update);
}

RunnerCallback.addBenchmarkResult = async (id, result) => {
	let search = {
		query: {
			match: {
				id: id,
			}
		}
	};

	console.log("addBenchmarkResult", result);

	let es = await getEs("bm_case");

	let res = await CommonService.request(es.protocol, es.es, `${es.index}/_search`, search);

	let oldResults = [];
	if (res.hits.hits.length > 0) {

		let currentLengh = res.hits.hits[0]._source.results.length
		oldResults = JSON.parse(res.hits.hits[0]._source.results || "[]")
		//最大只存1m，超过则开始丢弃头部的
		if (currentLengh >= 1024 * 1024) {
			oldResults.shift()
		}
		oldResults.push(result);
	}

	let update = {
		doc: {
			id: id,
			results: JSON.stringify(oldResults),
			posttime: new Date()
		},
	};

	console.log("addBenchmarkResult", update);

	await CommonService.request(es.protocol, es.es, `${es.index}/_update/${id}`, update);
}

//////////////////////////////////////////////////////////////////////////////////////////////

const InfTestService = function () {
	this.init_index_test_inf = createIndex("test_inf");
	this.init_index_bm_case = createIndex("bm_case");

	this.getContextFromDB = async (id) => {
		let search = {
			query: {
				match: {
					f_id: id
				}
			}
		};

		let es = await getEs("test_inf");

		let res = await CommonService.request(es.protocol, es.es, `${es.index}/_search`, search);

		// console.log(res);
		let hits = [];
		res.hits.hits.forEach(hit => {
			hits.push(hit._source);
		});
		return hits[0];

		// return await InfTestDao.getContext(id);
	}

	/**
	 * @name addTarsFile 将解析后的tars文件插入数据库
	 * @param {Object} params
	 * @returns {Object} 插入的记录
	 */
	this.addTarsFile = async (params) => {

		let f_id = hash(params.application + "-" + params.server_name);
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

		let es = await getEs("test_inf");

		await CommonService.request(es.protocol, es.es, `${es.index}/_update/${f_id}`, update);

		delete params.context;
		delete params.benchmark_context;
		delete params.posttime;

		return params;
	}

	/**
	 * @name getTarsFile 获取解析后的tars文件记录
	 * @param {Object} params
	 * @param {Array} fields
	 * @returns {Object} 插入的记录
	 */
	this.getTarsFile = async (params, fields) => {

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
	}

	/**
	 * 从DB删除解析后的tars文件
	 * @param {String} id tars文件ID
	 * @returns {Number} 删除的记录数
	 */
	this.deleteTarsFile = async (id) => {

		let es = await getEs("test_inf");

		let res = await CommonService.request(es.protocol, es.es, `${es.index}/_doc/${id}`, null, "delete");

		return res;
	}

	this.getBmCaseList = async (servant, fn) => {
		let search = {
			query: {
				bool: {
					must: [{
						match: {
							servant: servant
						}
					}, {
						match: {
							fn: fn
						}
					}]
				}
			},
		};

		let es = await getEs("bm_case");

		let res = await CommonService.request(es.protocol, es.es, `${es.index}/_search`, search);

		let hits = [];
		res.hits.hits.forEach(hit => {
			hits.push(hit._source);
		});

		return hits;
	}

	this.getResultById = async (id) => {

		let search = {
			query: {
				match: {
					id: id,
				}
			}
		};

		let es = await getEs("bm_case");

		let res = await CommonService.request(es.protocol, es.es, `${es.index}/_search`, search);

		if (res.hits.hits.length > 0) {
			return res.hits.hits[0]._source;
		} else {
			return null;
		}
	}

	this.upsertBmCase = async (caseInfo) => {
		if (!caseInfo.id) {
			caseInfo.id = hash(caseInfo.servant + "-" + caseInfo.fd + "-" + caseInfo.des + "-" + (new Date().getTime()));
		}
		let update = {
			doc: caseInfo,
			doc_as_upsert: true
		};
		// console.log(caseInfo);

		let es = await getEs("bm_case");

		return await CommonService.request(es.protocol, es.es, `${es.index}/_update/${caseInfo.id}`, update);
	}

	this.getRunnerCallback = () => {
		return RunnerCallback;
	}

	this.deleteBmCase = async (id, servant) => {

		let search = {
			query: {
				bool: {
					must: [{
						match: {
							servant: servant
						}
					}, {
						match: {
							id: id
						}
					}]
				}
			},
		};
		let es = await getEs("bm_case");

		return await CommonService.request(es.protocol, es.es, `${es.index}/_delete_by_query`, search);
	}

	//////////////////////////////////////////////////////////////////////////////////////
	/**
	 * @name getTestCase 获取测试用例
	 * @param {Object} params 
	 * @param {Array} fields
	 * @returns {Object} 测试用例 
	 */
	this.getTestCase = async (params, fields) => {
		let search = {
			query: {
				match: params
			}
		};

		let es = await getEs("test_case");

		let res = await CommonService.request(es.protocol, es.es, `${es.index}/_search`, search);

		// console.log(res);
		let hits = [];
		res.hits.hits.forEach(hit => {
			hits.push(hit._source);
		});
		return {
			count: hits.length,
			rows: hits
		};
	}


	/**
	 * @name addTestCase 将测试用例插入数据库
	 * @param {Object} params 
	 * @returns {Object} 插入的记录
	 */
	this.addTestCase = async (params) => {

		params.case_id = hash(params.test_case_name + "-" + params.application + "-" + params.server_name + "-" + (new Date()).getTime());

		let update = {
			doc: params,
			doc_as_upsert: true
		};

		let es = await getEs("test_case");

		try {
			await CommonService.request(es.protocol, es.es, `${es.index}/_update/${params.case_id}`, update);
		} catch (e) {
			throw e;
		}

		delete params.context;
		delete params.posttime;
		return (await InfTestService.getTestCase({
			case_id: params.case_id
		}, ['case_id', 'f_id', 'test_case_name', 'server_name', 'file_name', 'posttime', 'context', 'object_name', 'module_name', 'interface_name', 'function_name', 'posttime', 'modify_user']));
	}


	/**
	 * @name getTestCaseList 获取测试用例列表
	 * @param {String} params 匹配字段
	 * @param {String} curPage 当前页
	 * @param {String} pageSize 每页数据条数
	 * @returns {Object} 测试用例列表
	 */
	this.getTestCaseList = async (params) => {
		let search = {
			query: {
				match: params
			},
		};

		let res;
		try {
			let es = await getEs("test_case");

			res = await CommonService.request(es.protocol, es.es, `${es.index}/_search`, search);
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

		return {
			count: hits.length,
			rows: hits
		}
	}


	/**
	 * @name deleteTestCase 从DB删除对应测试用例
	 * @param {String} case_id 用例ID
	 * @returns {Number} 删除的记录数
	 */
	this.deleteTestCase = async (case_id) => {

		let es = await getEs("test_case");

		let res = await CommonService.request(es.protocol, es.es, `${es.index}/_doc/${case_id}`, null, "delete");

		return res;
	}

	/**
	 * @name modifyTestCase 修改对应测试用例
	 * @param {String} case_id 用例ID
	 * @param {String} test_case_name 用例名字
	 * @param {String} params 用例参数
	 */
	this.modifyTestCase = async (case_id, test_case_name, params, modify_user) => {
		let update = {
			doc: {
				case_id: case_id,
				test_case_name: test_case_name,
				params: params,
				modify_user: modify_user
			},
		};

		let data = await this.getTestCase({
			case_id: case_id
		});

		let es = await getEs("test_case");

		let res = await CommonService.request(es.protocol, es.es, `${es.index}/_update/${case_id}`, update);

		return res;
	}
}


module.exports = InfTestService;