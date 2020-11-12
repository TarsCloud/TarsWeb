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
const IDCService = require('../../service/idc/IDCService');
const _ = require('lodash');
const util = require('../../tools/util');

const IDCController = {};
const IDCStruct = {
    group_id: '',
    ip_order: '',
    allow_ip_rule: {
        formatter: (value) => {
            return value == null ? "" : value;
        }
    },
    denny_ip_rule: {
        formatter: (value) => {
            return value == null ? "" : value;
        }
    },
    lastuser: '',
    modify_time: {formatter: util.formatTimeStamp},
    group_name: '',
    group_name_cn: ''
}

IDCController.getIDCGroupList = async (ctx) => {
    try {
        let groupName = ctx.paramsObj.group_name || '';
        ctx.makeResObj(200, '', util.viewFilter(await IDCService.getIDCGroupList(groupName), IDCStruct));
    } catch (e) {
        logger.error('[getIDCGroupList]', e, ctx);
        ctx.makeErrResObj();
    }
};

IDCController.getIDCGroupDict = async (ctx) => {
    try {
        const IDCDictStruct = {group_name: '', group_name_cn: ''}
        ctx.makeResObj(200, '', util.viewFilter(await IDCService.getIDCGroupDict(), IDCDictStruct));
    } catch (e) {
        logger.error('[getIDCGroupList]', e, ctx);
        ctx.makeErrResObj();
    }
};


IDCController.addIDCGroup = async (ctx) => {
    try {
        let params = {
            group_name: ctx.paramsObj.group_name,
            group_name_cn: ctx.paramsObj.group_name_cn,
            ip_order: ctx.paramsObj.ip_order,
            allow_ip_rule: ctx.paramsObj.allowList.join("|"),
            denny_ip_rule: ctx.paramsObj.dennyList.join("|"),
            lastuser: ctx.uid
        }
        ctx.makeResObj(200, '', util.viewFilter(await IDCService.addIDCGroup(params), IDCStruct));
    } catch (e) {
        logger.error('[addIDCGroup]', e, ctx);
        ctx.makeErrResObj();
    }
}

IDCController.deleteIDCGroup = async (ctx) => {
    try {
        let group_id = ctx.paramsObj.group_id;
        await IDCService.deleteIDCGroup(group_id);
        ctx.makeResObj(200, '', [group_id]);
    } catch (e) {
        logger.error('[deleteIDCGroup]', e, ctx);
        ctx.makeErrResObj();
    }
};

IDCController.updateIDCGroup = async (ctx) => {
    try {
        let params = {
            group_id: ctx.paramsObj.group_id,
            group_name: ctx.paramsObj.group_name,
            group_name_cn: ctx.paramsObj.group_name_cn,
            ip_order: ctx.paramsObj.ip_order,
            allow_ip_rule: ctx.paramsObj.allowList.join("|"),
            denny_ip_rule: ctx.paramsObj.dennyList.join("|"),
            lastuser: ctx.uid
        }
        ctx.makeResObj(200, '', util.viewFilter(await IDCService.updateIDCGroup(params), IDCStruct));
    } catch (e) {
        logger.error('[updateIDCGroup]', e, ctx);
        ctx.makeErrResObj();
    }
}


module.exports = IDCController;
