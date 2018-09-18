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

const {tTracingSpan} = require('./db').db_tracing;

let CallChainDao = {};

CallChainDao.getTraceList = async(params) => {
    
    let whereObj = {}
    if(params.id) {
        Object.assign(whereObj, {trace_id : {
            $like : `${params.id}%`
        }});
    }
    if(params.start_time && params.end_time) {
        Object.assign(whereObj, {timestamp : {
            $Between : [params.start_time, params.end_time]
        }});
    }    
    
    let ret = await tTracingSpan.findAll({
        raw : true,
        attributes: ['trace_id','my_timestamp','duration'],
        group:'trace_id',
        where : whereObj
    });
    return ret;
}

CallChainDao.getTraceDetailList = async(id) => {
    let ret = await tTracingSpan.findAll({
        raw : true,
        attributes: ['trace_id', 'span_id', 'name', 'status', 'my_timestamp', 'duration', 'server_endpoint_ipv4', 'server_endpoint_service_name', 'my_type', 'layer', 'parent_id'],
        where:{
            trace_id : id
        }
    });
    return ret;
}


function filterParams(obj) {
    for(var item in obj) {
        if(!obj[item] && obj[item]!== ''){
            delete obj[item];
        }
    }
    return obj;
}

module.exports = CallChainDao;