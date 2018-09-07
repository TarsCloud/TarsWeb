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

//const {tCallChains} = require('./db').db_tars;

let CallChainDao = {};

CallChainDao.getTraceList = async(params) => {
    
    // let ret = await tCallChains.findAll({
    //     raw : true,
    //     where : {
    //         create_time : {
    //             $Between : [params.start_time, params.end_time]
    //         },
    //         id : {
    //             $like : `${params.id}%`
    //         }
    //     }
    // });
    let mockData = [{
        id : 101242533232, create_time : '2018-09-06 17:56:00', use_time : 10
    }]
    return mockData;
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