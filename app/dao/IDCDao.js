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

const {tServerGroupRule} = require('./db').db_tars;
const Sequelize = require('sequelize');
const IDCDao = {};

IDCDao.getIDCGroupList = async (groupName) => {
    return await tServerGroupRule.findAll({
        where: {
            group_name: {
                [Sequelize.Op.like]: '%' + groupName + '%'
            }
        }
    });
};

IDCDao.getIDCGroupDict = async () => {
    return await tServerGroupRule.findAll();
};

IDCDao.addIDCGroup = async (params) => {
    return await tServerGroupRule.create({
        group_name: params.group_name,
        group_name_cn: params.group_name_cn,
        ip_order: params.ip_order,
        allow_ip_rule: params.allow_ip_rule,
        denny_ip_rule: params.denny_ip_rule,
        lastuser:params.lastuser
    });
};

IDCDao.updateIDCGroup = async (params) => {
    return await tServerGroupRule.update({
        group_name_cn: params.group_name_cn,
        ip_order: params.ip_order,
        allow_ip_rule: params.allow_ip_rule,
        denny_ip_rule: params.denny_ip_rule,
        lastuser:params.lastuser
    }, {
        where: {
            group_id: params.group_id,
        }
    });
};

IDCDao.deleteIDCGroup = async (group_id) => {
    return await tServerGroupRule.destroy({
        where: {
            group_id: group_id
        }
    });
};

module.exports = IDCDao;




