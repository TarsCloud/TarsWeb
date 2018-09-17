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
const ServerService = require('../../service/server/ServerService');
const PanshiService = require('../../service/panshi/PanshiService');
const DeployServerController = {};
const util = require('../../tools/util');

const serverConfStruct = {
    id: '',
    application: '',
    server_name: '',
    node_name: '',
    server_type: '',
    enable_set: {formatter: (value)=>{return value == 'Y' ? true : false;}},
    set_name: '',
    set_area: '',
    set_group: '',
    setting_state: '',
    present_state: '',
    bak_flag: {formatter: (value)=>{return value == 0 ? false : true;}},
    template_name: '',
    profile: '',
    async_thread_num: '',
    base_path: '',
    exe_path: '',
    start_script_path: '',
    stop_script_path: '',
    monitor_script_path: '',
    patch_time: util.formatTimeStamp,
    patch_version: "",
    process_id: '',
    posttime: {formatter: util.formatTimeStamp}
};

DeployServerController.deployServer = async(ctx) => {
    var params = ctx.paramsObj;
    try {
        let panshiRegister = await PanshiService.register(params);
        let rst = await ServerService.addServerConf(params);
        rst.server_conf = util.viewFilter(rst.server_conf, serverConfStruct);
        ctx.makeResObj(200, '', rst);
    } catch (e) {
        logger.error('[deployServer]', e, ctx);
        ctx.makeResObj(500, e.message);
    }
};

DeployServerController.serverTypeList = async(ctx) => {
    try {
        let ServerTypeList = ['tars_cpp', 'tars_java', 'tars_nodejs', 'tars_php'];
        ctx.makeResObj(200, '', ServerTypeList);
    } catch (e) {
        logger.error('[serverTypeList]', e, ctx);
        ctx.makeResObj(500, e.message);
    }
};


module.exports = DeployServerController;