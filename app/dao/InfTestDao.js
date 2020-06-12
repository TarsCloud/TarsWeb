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
const {tTarsFiles, tBmCase, sequelize} = require('./db').db_tars_web;
module.exports = {
	sequelize: sequelize,
	addTarsFile: async (params) => {
		return tTarsFiles.upsert(params, {
			fields: ['server_name', 'file_name', 'posttime', 'context', 'benchmark_context']
		})
	},

	getTarsFile: async (params, fields) => {
		let opt = {
			raw: true,
			where: params
		};
		if (fields) {
			Object.assign(opt, {attributes: fields});
		}
		return tTarsFiles.findAll(opt);
	},

	getContext: async (id) => {
		return tTarsFiles.findOne({
			raw: true,
			where: {
				f_id: id
			},
			attributes: ['context','benchmark_context']
		})
	},

	deleteTarsFile: async (id) => {
		return tTarsFiles.destroy({
			where: {
				f_id: id
			}
		});
	},
	getBmCaseList: async (servant, fn)=>{
		let is_deleted = 0
		return await tBmCase.findAll({where:{
			servant, fn, is_deleted
		},attributes: { exclude: ["results"] }})
	},
	getBmResultById: async (id)=>{
		return await tBmCase.findOne({where:{id},attributes: { include: ["id","servant","fn","status", "results"] }})
	},
	upsertBmCase: async (caseInfo)=>{
		return await tBmCase.upsert(caseInfo, { returning: true } );
	},
	isBmCaseRunning: async(servant, fn, transaction)=>{
		let options = {
			where:{
				servant: servant,
				fn: fn,
				status:1
			}
		}
		if(transaction) options.transaction = transaction
		let running = await tBmCase.findOne(options)
		if(!running) return false
		//超过一分钟未更新，认为是server挂掉了，任务死在了运行状态，重置为未运行状态
		if(new Date().getTime() - new Date(running.posttime).getTime() >= 60000){
			running.status = 0
			await running.save({transaction})
			return false
		}
		return running
	},
	startBenchmark: async(id, transaction)=>{
		let options = {
			where:{id: id}
		}
		if(transaction) options.transaction = transaction
		return await tBmCase.update({status:1, posttime:new Date()},options)
	},
	stopBenchmark: async(id, transaction)=>{
		let options = {
			where:{id}
		}
		if(transaction) options.transaction = transaction
		return await tBmCase.update({status:0},options)
	},
	clearBenchmarkResult: async (id, transaction)=>{
		let options = {
			where:{id}
		}
		if(transaction) options.transaction = transaction
		return await tBmCase.update({results:""},options)
	},
	addBenchmarkResult: async (id, result, transaction)=>{
		let options = {
			where:{id}
		}
		if(transaction) options.transaction = transaction
		let bmCase = await tBmCase.findOne(options)
		let currentLengh = bmCase.results.length
		let oldResults = JSON.parse(bmCase.results || "[]")
		//最大只存1m，超过则开始丢弃头部的
		if(currentLengh >= 1024*1024) {
			oldResults.shift()
		}
		oldResults.push(result)
		return await tBmCase.update({results:JSON.stringify(oldResults), posttime:new Date()},options)
	}
};
