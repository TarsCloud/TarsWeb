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

const limit = require('koa-limit');
const limitConf = require('../../config/webConf').limitConf || {};

module.exports = () => {
	if (limitConf.enableLimit) {
		return limit({
			limit: limitConf.limit || 5000,
			interval: limitConf.interval || 1000 * 60 * 60,
			whiteList: limitConf.whilteList || [],
			blackList: limitConf.blackList || [],
		});
	} else {
		return async (ctx, next) => {
			await next();
		};
	}
};