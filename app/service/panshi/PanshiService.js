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

const PanshiRequest = require('./panshiRequest.js');

const panshiRequest = new PanshiRequest();

const PanshiService = {};

module.exports = PanshiService;

PanshiService.queryService = async function () {
    let params = panshiRequest.getParam();
    return panshiRequest.request({params, url: '/cmdb/query_service'})
};

PanshiService.querySystem = async function ({ServiceId}) {
    let params = panshiRequest.getParam({ServiceId});
    return panshiRequest.request({params, url: '/cmdb/query_system'})
};

PanshiService.queryModule = async function ({SystemId}) {
    let params = panshiRequest.getParam({SystemId});
    return panshiRequest.request({params, url: '/cmdb/query_module'})
};

PanshiService.register = async function (option) {
    let param = {
        third_res_id: '' + option.thirdlyBusiness,
        server_name: option.server_name,
        server_name_chn: option.server_name,
        dev_lang: panshiRequest.transformLangType(option.server_type)

    };
    let params = panshiRequest.getParam(param);
    return panshiRequest.request({params, url: '/module/register'})
};




