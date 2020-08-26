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

const Dao = require('../../dao/BusinessRelationDao');
const Service = {};

Service.add = async (business_name, application_name, uid) => {
	let obj = {
		f_business_name: business_name,
		f_application_name: application_name,
		f_create_person: uid,
		f_create_time: new Date(),
		f_update_person: uid,
		f_update_time: new Date(),
	};
	return await Dao.add(obj);
}

Service.delete = async (id) => {
	return await Dao.delete(id);
};

Service.update = async (params) => {
	return await Dao.update(params);
};

Service.getList = async (business_name, application_name) => {
	return await Dao.getList(business_name, application_name);
};


module.exports = Service;