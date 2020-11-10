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
const AdminService = require('../../service/admin/AdminService');
const ServerService = require('../../service/server/ServerService');
const util = require('../../tools/util');
const TaskDao = require('../../dao/TaskDao');
const AuthService = require('../../service/auth/AuthService');

const LogviewService = {};

LogviewService.getLogFileList = async(application, server_name, node_name) => {
    // logger.info("=======LogviewService 1", application, server_name, node_name)
    let rsp = await AdminService.getLogFileList(application, server_name, node_name);
    // logger.info('getLogFileList:', rsp);
    return {
        iRet: 0,
        data: rsp
    }
};

LogviewService.getQueryParam = function(paramStr) {
    var param = JSON.parse(paramStr);
    var cmd = "";
    var searchLine = parseInt(param.search_lines);
    if (searchLine <= 0 || searchLine >= 50000) {
        searchLine = 50000;
    }
    if (param.search_sign == "from_end") {
        cmd = "tail -" + searchLine + " __log_file_name__";
    } else {
        cmd = "head -" + searchLine + " __log_file_name__";
    }

    var keyword = param.keyword;
    var grepFlag = " -a ";
    if (param.ignoreCase == "Y") {
        grepFlag += " -i ";
    }

    if (keyword.length > 0) {
        cmd = cmd + " | grep " + grepFlag + keyword;
    }

    var showLine = parseInt(param.lines);
    if (searchLine <= 0 || searchLine >= 5000) {
        searchLine = 1000;
    }

    if (param.view_direction == "from_end") {
        cmd += "|tail -" + showLine;
    } else {
        cmd += "|head -" + showLine;
    }
    cmd += " | iconv -c -f UTF-8 -t UTF-8|sed 's/[\\cA-\\cZ]//g'";
    // console.log("=============>getQueryParam cmd:" + cmd);
    return cmd;
}

LogviewService.getLogData = async(application, server_name, node_name, log_file, interface_params) => {
    var newCmd = LogviewService.getQueryParam(interface_params);
    // logger.info("=======LogviewService getLogData 2:", application, server_name, node_name, log_file, newCmd)

    let rsp = await AdminService.getLogData(application, server_name, node_name, log_file, newCmd);
    // logger.info('getLogData:', rsp);
    return {
        iRet: 0,
        cmd: newCmd.replace("__log_file_name__", log_file),
        data: rsp
    }
};


module.exports = LogviewService;
