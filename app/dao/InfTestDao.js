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
 
const {tTarsFiles} = require('./db').db_tars_web;

module.exports = {
    addTarsFile : async(params) => {
        return tTarsFiles.upsert(params,{
            fields : ['server_name','file_name','posttime','context']
        })
    },

    getTarsFile : async(params, fields) => {
        let opt = {
            raw :true,
            where : params
        };
        if(fields) {
            Object.assign(opt, {attributes:fields});
        }
        return tTarsFiles.findAll(opt);
    },

    getContext : async(id) => {
        return tTarsFiles.findOne({
            raw : true,
            where : {
                f_id : id
            },
            attributes : ['context']
        })
    },

    deleteTarsFile : async(id) => {
        return tTarsFiles.destroy({
            where : {
                f_id : id
            }
        });
    }
};
