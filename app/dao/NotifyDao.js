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

const {tServerNotifys} = require('./db').db_tars;

const NotifyDao = {};


NotifyDao.getServerNotifyList = async (serverIds, curPage, pageSize) => {
	let where = {};
	where.server_id = serverIds || [];
	let options = {
		raw: true,
		where: where,
		order: [['notifytime', 'DESC']]
	};
	if (curPage && pageSize) {
		options.limit = pageSize;
		options.offset = pageSize * (curPage - 1);
	}
	return await tServerNotifys.findAndCountAll(options);
};


module.exports = NotifyDao;