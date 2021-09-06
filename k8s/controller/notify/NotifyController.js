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
const request = require('request');
const CommonService = require('../../service/common/CommonService');
const NotifyController = {};
const moment = require('moment');

const queryNotify = (app, server, page, size) => {
    return new Promise((resolve) => {
        let result = {
            ret: -1,
            msg: 'error'
        }

        if (page <= 0) {
            page = 1;
        }
        try {

			let search = {
                query: { bool: { must: [{ match: {app: app }}]} },
                sort: [
                    { notifyTime: "desc" }
                ],
                from: (page - 1) * size,
                size: size
			};

            if (server) {
                search.query.bool.must.push({
                    match: {
                    server: server
                }});
            }

            const date = moment((new Date())).format("YYYYMMDD");

            if (!CommonService.ELS.endsWith("/"))
                CommonService.ELS += "/";
            
            const url = `${CommonService.ELS}notify_${CommonService.NAMESPACE}_${date}/_search`;
       
            // console.log(url, JSON.stringify(search));

            const options = {
                url: url,
                method: 'POST',
                headers: {
                   "Content-Type":"application/json"
                },
				body: JSON.stringify(search),
                timeout: 100000,
            }
           
            request(options, (error, response, body) => {

                try {
                    if (!error) {

                        // logger.info(`query notify response:${response.statusCode}, ${body}`);

                        if (response.statusCode == 200) {
                            let rsp = JSON.parse(response.body).hits;
                    
                            result.ret = 0;
                            result.msg = "succ";
                            result.data = rsp;
                            resolve(result)
                        } else {
                            let rsp = JSON.parse(response.body);
                            result.msg = JSON.stringify(rsp.error);
                            resolve(result)

                        }
                    } else {
                        result.msg = error;
                        resolve(result)
                    }
                } catch (e) {

                    console.log(e);
                    result.msg = e;
                    resolve(result)
                }
            })
        } catch (e) {
            result.msg = e.message
            resolve(result)
            logger.error('[queryNotify]', e)            
        }
    })
}

NotifyController.NotifySelect = async(ctx) =>{

	let { ServerId = '', page = 1, size = 10 } = ctx.paramsObj
    try {

        let app = ServerId.split('.')[0];
        let server = ServerId.split('.')[1];

        let data = await queryNotify(app, server, page, size)

        if(data.ret === 0){
            ctx.makeResObj(200, data.msg, data.data)
        }else{
            ctx.makeResObj(500, data.msg)
        }
    } catch (e) {
        logger.error('[NotifySelect]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}
	
module.exports = NotifyController;