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

const logger = require('../../../logger');
const axios = require('axios');
const CommonService = require('../../service/common/CommonService');
const NotifyController = {};
const moment = require('moment');
const TemplateService = require("../../service/template/TemplateService")

const queryNotify = async (app, server, page, size) => {
    if (page <= 0) {
        page = 1;
    }
    try {
        let search = {
            query: {
                bool: {
                    must: [{
                        match: {
                            app: app
                        }
                    }]
                }
            },
            sort: [{
                notifyTime: "desc"
            }],
            from: (page - 1) * size,
            size: size
        };
        server && (search.query.bool.must.push({
            match: {
                server: server
            }
        }))

        let esConfig = await TemplateService.getEsConfig();

        let esNodes = Object.keys(esConfig.tars.elk.nodes)[0].split(",");

        let url = `${esConfig.tars.protocol}://${esNodes[0]}/${esConfig.tars.elk.index.notify}/_search`
        // console.log(url);

        let res = await axios({
            url: url,
            method: 'GET',
            headers: {
                "Content-Type": "application/json"
            },
            data: JSON.stringify(search),
            timeout: 100000,
        });
        return {
            ret: 0,
            msg: res.data.hits
        };
    } catch (e) {
        logger.error('[queryNotify]', e)
        return {
            ret: -1,
            msg: e.message || e.response.data.error
        };
    }
}

NotifyController.NotifySelect = async (ctx) => {

    let {
        ServerId = '', page = 1, size = 10
    } = ctx.paramsObj
    try {

        let app = ServerId.split('.')[0];
        let server = ServerId.split('.')[1];

        let data = await queryNotify(app, server, page, size)

        if (data.ret === 0) {
            ctx.makeResObj(200, "", data.msg)
        } else {
            ctx.makeResObj(500, data.msg)
        }
    } catch (e) {
        logger.error('[NotifySelect]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

module.exports = NotifyController;