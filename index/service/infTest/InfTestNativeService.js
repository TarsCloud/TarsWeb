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

const InfTestDao = require('../../../app/dao/InfTestDao');
const TestCaseDao = require('../../../app/dao/TestCaseDao');

//////////////////////////////////////////////////////////////////////////////////////
const RunnerCallback = {};

RunnerCallback.isBmCaseRunning = async (caseId, servant, fn) => {
	//判断是否可以启动，并设置状态为start
	let transaction = await InfTestDao.sequelize.transaction();
	try {
		let isRunning = await InfTestDao.isBmCaseRunning(servant, fn, transaction);
		console.log(isRunning);
		if (isRunning) {
			return true;
		}
		await InfTestDao.startBenchmark(caseId, transaction)
		await transaction.commit();
		return isRunning;
	} catch (e) {
		await transaction.rollback();
		throw e
	}
}

RunnerCallback.startBenchmark = async (caseId, transaction) => {
	return await InfTestDao.startBenchmark(caseId, transaction);
}

RunnerCallback.stopBenchmark = async (caseId) => {
	return await InfTestDao.stopBenchmark(caseId)

}

RunnerCallback.clearBenchmarkResult = async (caseId) => {
	return await InfTestDao.clearBenchmarkResult(caseId);
}

RunnerCallback.addBenchmarkResult = async (caseId, result) => {
	return await InfTestDao.addBenchmarkResult(caseId, result);
}

//////////////////////////////////////////////////////////////////////////////////////////////

const InfTestService = function () {

	/**
	 * @name addTarsFile 将解析后的tars文件插入数据库
	 * @param {Object} params
	 * @returns {Object} 插入的记录
	 */
	this.addTarsFile = async (params) => {
		console.log(params);
		await InfTestDao.addTarsFile(params);
		delete params.context;
		delete params.benchmark_context;
		delete params.posttime;
		return (await this.getTarsFile(params, ['f_id', 'application', 'server_name', 'file_name', 'posttime']))[0];
	}

	/**
	 * @name getTarsFile 获取解析后的tars文件记录
	 * @param {Object} params
	 * @param {Array} fields
	 * @returns {Object} 插入的记录
	 */
	this.getTarsFile = async (params, fields) => {
		// console.log(params);
		return await InfTestDao.getTarsFile(params, fields);
	}

	this.getContextFromDB = async (id) => {
		return await InfTestDao.getContext(id);
	}

	/**
	 * 从DB删除解析后的tars文件
	 * @param {String} id tars文件ID
	 * @returns {Number} 删除的记录数
	 */
	this.deleteTarsFile = async (id) => {
		return await InfTestDao.deleteTarsFile(id);
	}

	this.getBmCaseList = async (servant, fn) => {
		return await InfTestDao.getBmCaseList(servant, fn)
	}

	this.upsertBmCase = async (caseInfo) => {
		//状态更新为停止时，调用代理服务停止压测
		if (("status" in caseInfo) && caseInfo.status == 0) {

		}
		return await InfTestDao.upsertBmCase(caseInfo)
	}

	this.deleteBmCase = async (id, servant) => {
		return await InfTestDao.deleteBmCase(id, servant)
	}

	this.getRunnerCallback = () => {
		return RunnerCallback;
	}

	this.getResultById = async (id) => {
		let row = await InfTestDao.getBmResultById(id);

		return row;
	}

	/**
	 * @name getTestCase 获取测试用例
	 * @param {Object} params 
	 * @param {Array} fields
	 * @returns {Object} 测试用例 
	 */
	this.getTestCase = async (params, fields) => {
		return await TestCaseDao.getTestCase(params, fields);
	}


	/**
	 * @name addTestCase 将测试用例插入数据库
	 * @param {Object} params 
	 * @returns {Object} 插入的记录
	 */
	this.addTestCase = async (params) => {
		await TestCaseDao.addTestCase(params);
		delete params.context;
		delete params.posttime;
		return (await this.getTestCase(params, ['case_id', 'f_id', 'test_case_name', 'server_name', 'file_name', 'posttime', 'context', 'object_name', 'module_name', 'interface_name', 'function_name', 'posttime', 'modify_user']))[0];
	}


	/**
	 * @name getTestCaseList 获取测试用例列表
	 * @param {String} params 匹配字段
	 * @returns {Object} 测试用例列表
	 */
	this.getTestCaseList = async (params) => {
		return await TestCaseDao.getTestCaseList(params);
	}


	/**
	 * @name deleteTestCase 从DB删除对应测试用例
	 * @param {String} case_id 用例ID
	 * @returns {Number} 删除的记录数
	 */
	this.deleteTestCase = async (case_id) => {
		return await TestCaseDao.deleteTestCase(case_id);
	}

	/**
	 * @name modifyTestCase 修改对应测试用例
	 * @param {String} case_id 用例ID
	 * @param {String} test_case_name 用例名字
	 * @param {String} params 用例参数
	 */
	this.modifyTestCase = async (case_id, test_case_name, params, modify_user) => {
		return await TestCaseDao.modifyTestCase(case_id, test_case_name, params, modify_user);
	}

}
module.exports = InfTestService;