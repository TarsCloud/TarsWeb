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
const Service = require('../../service/business/BusinessService');
const util = require('../../tools/util');

const Struct = {
	f_id: '',
	f_name: '',
	f_show_name: '',
	f_create_person: '',
	f_create_time: {
		formatter: util.formatTimeStamp
	},
	f_update_person: '',
	f_update_time: {
		formatter: util.formatTimeStamp
	},
	f_order: 1,
};

const Controller = {};

Controller.add = async (ctx) => {
	try {
		let name = ctx.paramsObj.f_name;
		let show_name = ctx.paramsObj.f_show_name;
		let order = ctx.paramsObj.f_order;
		ctx.makeResObj(200, '', util.viewFilter(await Service.add(name, show_name, order, ctx.uid), Struct));
	} catch (e) {
		logger.error('[addBusiness]', e, ctx);
		ctx.makeErrResObj();
	}
};

Controller.delete = async (ctx) => {
	try {
		let id = ctx.paramsObj.f_id;
		await Service.delete(id);
		ctx.makeResObj(200, '', [id]);
	} catch (e) {
		logger.error('[addBusiness]', e, ctx);
		ctx.makeErrResObj();
	}
};

Controller.update = async (ctx) => {
	try {
		let params = ctx.paramsObj;
		ctx.makeResObj(200, '', util.viewFilter(await Service.update(params), Struct));
	} catch (e) {
		logger.error('[updateBusiness]', e, ctx);
		ctx.makeErrResObj();
	}
};

Controller.getList = async (ctx) => {
	try {
		let name = ctx.paramsObj.f_name || '';
		ctx.makeResObj(200, '', util.viewFilter(await Service.getList(name), Struct));
	} catch (e) {
		logger.error('[getBusinessList]', e, ctx);
		ctx.makeErrResObj();
	}
};

module.exports = Controller;