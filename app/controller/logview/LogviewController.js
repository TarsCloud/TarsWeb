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
const LogviewService = require('../../service/logview/LogviewService');
const AuthService = require('../../service/auth/AuthService');
const WebConf = require('../../../config/webConf');
const util = require('../../tools/util');
const fs = require('fs-extra');

const LogviewController = {};

LogviewController.getLogFileList = async(ctx) => {
    try {
        const { application, server_name, node_name } = ctx.paramsObj;
   //     logger.error("======getLogFileList:", application, server_name, node_name, ctx.uid);
        if (!await AuthService.hasOpeAuth(application, server_name, ctx.uid)) {
            ctx.makeNotAuthResObj();
        } else {

            let rsp = await LogviewService.getLogFileList(
                application,
                server_name,
                node_name
            );

            ctx.makeResObj(200, '', JSON.stringify(rsp));
        }
    } catch (e) {
        logger.error('[getLogFileList]:', e, ctx);
        console.error(e);
        ctx.makeResObj(500, e.message);
    }
}

LogviewController.getLogData = async(ctx) => {
    try {
        const { application, server_name, node_name, log_file, interface_params } = ctx.paramsObj;
        if (!await AuthService.hasOpeAuth(application, server_name, ctx.uid)) {
            ctx.makeNotAuthResObj();
        } else {
            let rsp = await LogviewService.getLogData(
                application,
                server_name,
                node_name,
                log_file,
                interface_params
            );
            ctx.makeResObj(200, '', JSON.stringify(rsp));
        }
    } catch (e) {
        logger.error('[getLogData]:', e, ctx);
        console.error(e);
        ctx.makeResObj(500, e.message);
    }
}

module.exports = LogviewController;