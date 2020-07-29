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
const Service = require('../../service/businessRelation/BusinessRelationService');
const TreeService = require('../../service/server/TreeService');
const util = require('../../tools/util');

const Struct = {
	f_id: '',
	f_business_name: '',
	f_application_name: '',
	f_create_person: '',
	f_create_time: {
		formatter: util.formatTimeStamp
	},
	f_update_person: '',
	f_update_time: {
		formatter: util.formatTimeStamp
	},
};

const Controller = {};

Controller.add = async (ctx) => {
	try {
		let bname = ctx.paramsObj.f_business_name;
		let aname = ctx.paramsObj.f_application_name;

		const resultData = await Service.getList(bname, aname)
		if(resultData && Array.isArray(resultData) && resultData.length > 0){
			ctx.makeResObj(500, 'already exists', resultData);
		}else{
			const addData = await Service.add(bname, aname, ctx.uid)
			TreeService.setCacheData(1)
			ctx.makeResObj(200, '', util.viewFilter(addData, Struct))
		}
	} catch (e) {
		logger.error('[addBusinessRelation]', e, ctx);
		ctx.makeErrResObj();
	}
};

Controller.delete = async (ctx) => {
	try {
		let id = ctx.paramsObj.f_id;
		await Service.delete(id);
		TreeService.setCacheData(1);
		ctx.makeResObj(200, '', [id]);
	} catch (e) {
		logger.error('[addBusinessRelation]', e, ctx);
		ctx.makeErrResObj();
	}
};

Controller.update = async (ctx) => {
	try {
		let params = ctx.paramsObj;
		ctx.makeResObj(200, '', util.viewFilter(await Service.update(params), Struct));
	} catch (e) {
		logger.error('[updateBusinessRelation]', e, ctx);
		ctx.makeErrResObj();
	}
};

Controller.getList = async (ctx) => {
	try {
		let bname = ctx.paramsObj.f_business_name || '';
		let aname = ctx.paramsObj.f_application_name || '';
		ctx.makeResObj(200, '', util.viewFilter(await Service.getList(bname, aname), Struct));
	} catch (e) {
		logger.error('[getBusinessRelationList]', e, ctx);
		ctx.makeErrResObj();
	}
};

module.exports = Controller;