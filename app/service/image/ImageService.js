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

const ImageDao = require('../../dao/BaseImageDao');
const DockerRegistryDao = require('../../dao/DockerRegistryDao');
const ServerDao = require('../../dao/ServerDao');

const AdminService = require('../../service/admin/AdminService');

const Service = {};

Service.addRegistry = async (registry, username, password, remark) => {
	let obj = {
		registry: registry,
		username: username,
		password: password,
		remark: remark,
	};
	return await DockerRegistryDao.add(obj);
}

Service.deleteRegistry = async (id) => {
	if (await ImageDao.findRegistryId(id)) {
		return false;
	}
	return await DockerRegistryDao.delete(id);
};

Service.updateRegistry = async (params) => {
	return await DockerRegistryDao.update(params);
};

Service.checkRegistry = async (params) => {
	return await DockerRegistryDao.update(params);
};


Service.getRegistryList = async () => {
	return await DockerRegistryDao.getList();
};

////////////////////////////////////////////////////////////////

Service.addImage = async (image, registryId, remark) => {
	let obj = {
		image: image,
		remark: remark,
		registryId: registryId,
	};
	return await ImageDao.add(obj);
}

Service.deleteImage = async (id) => {
	if (await ServerDao.findBaseImageId(id)) {
		return false;
	}
	return await ImageDao.delete(id);
};

Service.updateImage = async (params) => {
	return await ImageDao.update(params);
};

Service.getImageList = async (offset, limit) => {
	return await ImageDao.getList(offset, limit);
};

Service.getImageRegistryList = async () => {
	return await ImageDao.getImageRegistryList();
};

Service.forceDockerLogin = async (nodeName) => {
	return await AdminService.forceDockerLogin(nodeName);
};

Service.checkDockerRegistry = async (registry, userName, password) => {
	return await AdminService.checkDockerRegistry(registry, userName, password);
};


module.exports = Service;