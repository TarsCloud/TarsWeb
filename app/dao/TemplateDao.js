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

const {tProfileTemplate} = require('./db').db_tars;
const Sequelize = require('sequelize');

const TemplateDao = {};

TemplateDao.addTemplate = async (params) => {
	return await tProfileTemplate.create({
		template_name: params.templateName,
		parents_name: params.parentsName,
		profile: params.profile,
		posttime: params.posttime,
		lastuser: params.lastUser
	});
};

TemplateDao.deleteTemplate = async (id) => {
	return await tProfileTemplate.destroy({
		where: {
			id: id
		}
	});
};

TemplateDao.updateTemplate = async (params) => {
	return await tProfileTemplate.update({
		template_name: params.template_name,
		parents_name: params.parents_name,
		profile: params.profile,
		posttime: params.posttime,
	}, {
		where: {
			id: params.id
		}
	});
};

TemplateDao.getTemplateById = async (id) => {
	return await tProfileTemplate.findOne({
		where: {
			id
		}
	});
};

TemplateDao.getTemplateByName = async (templateName) => {
	return await tProfileTemplate.findOne({
		where: {
			template_name: templateName
		}
	});
};

TemplateDao.getTemplateList = async (templateName, parentsName) => {
	return await tProfileTemplate.findAll({
		where: {
			template_name: {
				//$like: '%' + templateName + '%'
				//syntax breaking changes after V5, should be:
				[Sequelize.Op.like]: '%' + templateName + '%'
			},
			parents_name: {
				//$like: '%' + parentsName + '%'
				//syntax breaking changes after V5, should be:
				[Sequelize.Op.like]: '%' + parentsName + '%'
			}
		}
	});
};

module.exports = TemplateDao;
