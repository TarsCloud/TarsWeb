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
const CallChainService = require('../../service/callChain/CallChainService');
const util = require('../../tools/util');

const CallChainController = {}

CallChainController.getTraceList = async (ctx) => {
    let {id, start_time, end_time} = ctx.paramsObj;
    try {
        let ret = await CallChainService.getTraceList({id, start_time, end_time});
        ctx.makeResObj(200,'', util.viewFilter(ret, {trace_id:'', duration:'', timestamp:{formatter:util.formatTimeStamp}}));
    }catch(e) {
        logger.error('[CallChainController.getTraceList]:', e, ctx);
        ctx.makeErrResObj();
    }
}

CallChainController.getTraceDetailList = async (ctx) => {
    let id = ctx.paramsObj.id;
    try{
        let ret = await CallChainService.getTraceDetailList(id);
        ctx.makeResObj(200, '', ret);
    }catch(e) {
        logger.error('[CallChainController.getTraceDetailList]:', e, ctx);
        ctx.makeErrResObj();
    }
}

module.exports = CallChainController;