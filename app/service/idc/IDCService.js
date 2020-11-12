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

const IDCDao = require('../../dao/IDCDao');
const ServerService = require('../../service/server/ServerService');
const logger = require('../../logger');
const util = require('../../tools/util');
const IDCService = {};


IDCService.getIDCGroupList = async (groupName) => {
    return await IDCDao.getIDCGroupList(groupName);
};

IDCService.getIDCGroupDict = async () => {
    return await IDCDao.getIDCGroupDict();
};


IDCService.addIDCGroup = async (params) => {
    return await IDCDao.addIDCGroup(params);
};


IDCService.updateIDCGroup = async (params) => {
    return await IDCDao.updateIDCGroup(params);
};


IDCService.deleteIDCGroup = async (group_id) => {
    return await IDCDao.deleteIDCGroup(group_id);
};


module.exports = IDCService;
