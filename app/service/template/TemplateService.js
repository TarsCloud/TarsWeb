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

const TemplateDao = require('../../dao/TemplateDao');
const ServerService = require('../../service/server/ServerService');
const logger = require('../../logger');
const util = require('../../tools/util');
const TemplateService = {};

TemplateService.addTemplate = async (templateName, parentsName, profile) => {
	let template = {
		templateName: templateName,
		parentsName: parentsName,
		profile: profile,
		posttime: new Date(),
		lastUser: ''
	};
	return await TemplateDao.addTemplate(template);
}

TemplateService.deleteTemplate = async (id) => {
	let template = await TemplateService.getTemplateById(id);
	if (!template) {
		throw new Error('#api.nonexistent.template#');
		return;
	}
	let ref = await ServerService.getServerConfByTemplate(template.dataValues.template_name);
	if (ref.length) {
		throw new Error('#api.template.being.referred#');
		return;
	}
	return await TemplateDao.deleteTemplate(id);
};

TemplateService.updateTemplate = async (params) => {
	let template = await TemplateService.getTemplateById(params.id);
	if (!template) {
		throw new Error('#api.nonexistent.template#');
		return;
	}
	template = template.dataValues;
	if (params.template_name.toLowerCase() !== template.template_name.toLowerCase()) {
		let ref = await ServerService.getServerConfByTemplate(template.template_name);
		if (ref.length) {
			throw new Error('#api.template.being.referred#');
			return;
		}
	}
	let parent = await TemplateService.getTemplateByName(params.parents_name);
	if (!parent) {
		throw new Error('#api.nonexistent.parent.template#');
		return;
	}
	params.posttime = new Date();
	return await TemplateDao.updateTemplate(params);
};

TemplateService.getTemplateById = async (id) => {
	return await TemplateDao.getTemplateById(id);
};

TemplateService.getTemplateByName = async (templateName) => {
	return await TemplateDao.getTemplateByName(templateName);
};

TemplateService.getTemplateList = async (templateName, parentsName) => {
	return await TemplateDao.getTemplateList(templateName, parentsName);
};


module.exports = TemplateService;