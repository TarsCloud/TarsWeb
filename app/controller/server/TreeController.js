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
const TreeService = require('../../service/server/TreeService');
const AdminService = require('../../service/admin/AdminService');
const _ = require('lodash');
const util = require('../../tools/util');
const AuthService = require('../../service/auth/AuthService');

const TreeController = {};

TreeController.listTree = async (ctx) => {
	try {
		const { searchKey, type } = ctx.paramsObj
		if(type && type === '1'){
			await TreeService.setCacheData(1)
		}

		let data = await TreeService.getTreeNodes(searchKey, ctx.uid, '1');

		ctx.makeResObj(200, '', data);
	} catch (e) {
		logger.error('[listTree]', e, ctx);
		ctx.makeErrResObj();
	}
};

module.exports = TreeController;