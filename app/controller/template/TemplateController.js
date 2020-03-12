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
const TemplateService = require('../../service/template/TemplateService');
const AdminService = require('../../service/admin/AdminService');
const _ = require('lodash');
const util = require('../../tools/util');
const AuthService = require('../../service/auth/AuthService');

const templateStruct = {
	id: '',
	template_name: '',
	parents_name: '',
	profile: '',
	posttime: {formatter: util.formatTimeStamp}
};

const TemplateController = {};

TemplateController.addTemplate = async (ctx) => {
	try {
		let templateName = ctx.paramsObj.template_name;
		let parentsName = ctx.paramsObj.parents_name;
		let profile = ctx.paramsObj.profile;
		ctx.makeResObj(200, '', util.viewFilter(await TemplateService.addTemplate(templateName, parentsName, profile), templateStruct));
	} catch (e) {
		logger.error('[addTemplate]', e, ctx);
		ctx.makeErrResObj();
	}
};

TemplateController.deleteTemplate = async (ctx) => {
	try {
		let id = ctx.paramsObj.id;
		await TemplateService.deleteTemplate(id);
		ctx.makeResObj(200, '', [id]);
	} catch (e) {
		logger.error('[addTemplate]', e, ctx);
		ctx.makeErrResObj();
	}
};

TemplateController.updateTemplate = async (ctx) => {
	try {
		let params = ctx.paramsObj;
		await TemplateService.updateTemplate(params);
		ctx.makeResObj(200, '', util.viewFilter(await TemplateService.getTemplateById(params.id), templateStruct));
	} catch (e) {
		logger.error('[addTemplate]', e, ctx);
		ctx.makeErrResObj();
	}
};

TemplateController.getTemplate = async (ctx) => {
	try {
		let templateName = ctx.paramsObj.template_name;
		ctx.makeResObj(200, '', util.viewFilter(await TemplateService.getTemplateByName(templateName), templateStruct));
	} catch (e) {
		logger.error('[getTemplate]', e, ctx);
		ctx.makeErrResObj();
	}
};

TemplateController.getMergeTemplate = async (ctx) => {
	try {
		let templateName = ctx.paramsObj.template_name;
		ctx.makeResObj(200, '', {template: await AdminService.getProfileTemplate(templateName)});
	} catch (e) {
		logger.error('[getMergeTemplate]', e, ctx);
		ctx.makeErrResObj();
	}
};

TemplateController.getTemplateList = async (ctx) => {
	try {
		let templateName = ctx.paramsObj.template_name || '';
		let parentsName = ctx.paramsObj.parents_name || '';
		ctx.makeResObj(200, '', util.viewFilter(await TemplateService.getTemplateList(templateName, parentsName), templateStruct));
	} catch (e) {
		logger.error('[getTemplateList]', e, ctx);
		ctx.makeErrResObj();
	}
};
TemplateController.getTemplateNameList = async (ctx) => {
	try {
		let templateList = await TemplateService.getTemplateList('', '');
		let templateNameList = [];
		templateList.forEach((template) => {
			templateNameList.push(template.dataValues.template_name);
		});
		ctx.makeResObj(200, '', templateNameList);
	} catch (e) {
		logger.error('[getTemplateNameList]', e, ctx);
		ctx.makeErrResObj();
	}
};


module.exports = TemplateController;