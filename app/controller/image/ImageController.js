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

const logger = require('../../../logger');
const Service = require('../../service/image/ImageService');
const util = require('../../../tools/util');

// const Struct = {
// 	f_id: '',
// 	f_name: '',
// 	f_show_name: '',
// 	f_create_person: '',
// 	f_create_time: {
// 		formatter: util.formatTimeStamp
// 	},
// 	f_update_person: '',
// 	f_update_time: {
// 		formatter: util.formatTimeStamp
// 	},
// 	f_order: 1,
// };

const Controller = {};

Controller.addRegistry = async (ctx) => {
	try {
		let registry = ctx.paramsObj.registry || '';
		let username = ctx.paramsObj.username || '';
		let password = ctx.paramsObj.password || '';
		let remark = ctx.paramsObj.remark;
		ctx.makeResObj(200, '', await Service.addRegistry(registry, username, password, remark));
	} catch (e) {
		logger.error('[addRegistry]', e, ctx);
		ctx.makeErrResObj();
	}
};

Controller.deleteRegistry = async (ctx) => {
	try {
		let id = ctx.paramsObj.id;
		let data = await Service.deleteRegistry(id);

		if (!data) {
			ctx.makeResObj(500, '#imageService.form.NotDeleteRegistryTips#');
		} else {
			ctx.makeResObj(200, '', [id]);
		}
	} catch (e) {
		logger.error('[deleteRegistry]', e, ctx);
		ctx.makeErrResObj();
	}
};

Controller.checkDockerRegistry = async (ctx) => {
	try {
		let {
			registry,
			username,
			password = ''
		} = ctx.paramsObj;

		ctx.makeResObj(200, '', await Service.checkDockerRegistry(registry, username, password));
	} catch (e) {
		logger.error('[checkDockerRegistry]', e, ctx);
		ctx.makeErrResObj();
	}
};

Controller.updateRegistry = async (ctx) => {
	try {
		let params = ctx.paramsObj;
		ctx.makeResObj(200, '', await Service.updateRegistry(params));
	} catch (e) {
		logger.error('[updateRegistry]', e, ctx);
		ctx.makeErrResObj();
	}
};

Controller.getRegistryList = async (ctx) => {
	try {
		ctx.makeResObj(200, '', await Service.getRegistryList());
	} catch (e) {
		logger.error('[getRegistryList]', e, ctx);
		ctx.makeErrResObj();
	}
};

/////////////////////////////////////////////////////////////////////////////////

Controller.addImage = async (ctx) => {
	try {
		let image = ctx.paramsObj.image;
		let remark = ctx.paramsObj.remark;
		let registryId = ctx.paramsObj.registryId;
		ctx.makeResObj(200, '', await Service.addImage(image, registryId, remark));
	} catch (e) {
		logger.error('[addImage]', e, ctx);
		ctx.makeErrResObj();
	}
};

Controller.deleteImage = async (ctx) => {
	try {
		let id = ctx.paramsObj.id;
		let data = await Service.deleteImage(id);
		if (!data) {
			ctx.makeResObj(500, '#imageService.form.NotDeleteImageTips#');
		} else {
			ctx.makeResObj(200, '', [id]);
		}
	} catch (e) {
		logger.error('[deleteImage]', e, ctx);
		ctx.makeErrResObj();
	}
};

Controller.updateImage = async (ctx) => {
	try {
		let params = ctx.paramsObj;

		ctx.makeResObj(200, '', await Service.updateImage(params));
	} catch (e) {
		logger.error('[updateImage]', e, ctx);
		ctx.makeErrResObj();
	}
};

Controller.getImageList = async (ctx) => {
	try {
		let offset = parseInt(ctx.paramsObj.offset || 0);
		let limit = parseInt(ctx.paramsObj.limit || -1);
		ctx.makeResObj(200, '', await Service.getImageList(offset, limit));
	} catch (e) {
		logger.error('[getImageList]', e, ctx);
		ctx.makeErrResObj();
	}
};

Controller.getImageRegistryList = async (ctx) => {
	try {
		ctx.makeResObj(200, '', await Service.getImageRegistryList());
	} catch (e) {
		logger.error('[getImageList]', e, ctx);
		ctx.makeErrResObj();
	}
};

Controller.forceDockerLogin = async (ctx) => {
	try {
		let data = await Service.forceDockerLogin(ctx.paramsObj.nodeName);

		// console.log(data);

		ctx.makeResObj(200, '', data);
	} catch (e) {
		logger.error('[forceDockerLogin]', e, ctx);
		ctx.makeErrResObj();
	}
};

Controller.dockerPull = async (ctx) => {
	try {
		let data = await Service.dockerPull(ctx.paramsObj.id);

		// console.log(data);

		ctx.makeResObj(200, '', data);
	} catch (e) {
		logger.error('[forceDockerLogin]', e, ctx);
		ctx.makeErrResObj();
	}
};



module.exports = Controller;