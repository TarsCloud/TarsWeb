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
const AuthService = require('../../service/auth/AuthService');
const AdminService = require('../../service/admin/AdminService');

const TokenController = {}

TokenController.getTokens = async (ctx) => {
    try {
        let objs = ctx.paramsObj.objName.split(',');
        ctx.makeResObj(200, '', await AdminService.getTokens(objs));
    }catch(e) {
        logger.error('[TokenController.getTokens]:', e, ctx);
        ctx.makeErrResObj(e);
    }
}

TokenController.applyToken = async(ctx) =>{
    try {
        let {application, server_name, calledObjName} = ctx.paramsObj;
        ctx.makeResObj(200, '', await AdminService.applyToken({application, server_name, calledObjName}));
    }catch(e) {
        logger.error('[TokenController.applyToken]:', e, ctx);
        ctx.makeErrResObj(e);
    }
}

TokenController.deleteToken = async(ctx) => {
    try {
        let {application, server_name, calledObjName} = ctx.paramsObj;
        ctx.makeResObj(200, '', await AdminService.deleteToken({application, server_name, calledObjName}));
    }catch(e) {
        logger.error('[TokenController.applyToken]:', e, ctx);
        ctx.makeErrResObj(e);
    }
}

module.exports = TokenController;