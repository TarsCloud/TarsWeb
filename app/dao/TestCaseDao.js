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

const { tTarsTestCase } = require('./db').db_tars_web;

module.exports = {
    addTestCase: async (params) => {
        return tTarsTestCase.upsert(params, {
            fields: ['f_id', 'test_case_name', 'server_name', 'file_name', 'posttime', 'context', 'object_name', 'module_name', 'interface_name', 'function_name','modify_user']
        })
    },

    getTestCase: async (params, fields) => {
        let opt = {
            raw: true,
            where: params
        };
        if (fields) {
            Object.assign(opt, { attributes: fields });
        }
        return tTarsTestCase.findAll(opt);
    },

    getContext: async (id) => {
        return tTarsTestCase.findOne({
            raw: true,
            where: {
                case_id: id
            },
            attributes: ['context']
        })
    },

    deleteTestCase: async (id) => {
        return tTarsTestCase.destroy({
            where: {
                case_id: id
            }
        });
    },
    deleteTestCaseByFid: async (f_id) => {
        return tTarsTestCase.destroy({
            where: {
                f_id: f_id
            }
        });
    },

    getTestCaseList: async (params, curPage, pageSize) => {
        let options = {
            raw: true,
            where: params,
            order: [['posttime', 'DESC']]
        };
        if (curPage && pageSize) {
            options.limit = pageSize;
            options.offset = pageSize * (curPage - 1);
        }
        return await tTarsTestCase.findAndCountAll(options);
    },
    modifyTestCase: async (case_id, test_case_name, params, modify_user) => {
        let updateOptions = {
            test_case_name: test_case_name,
            context: params,
            modify_user: modify_user
        };
       
        return await tTarsTestCase.update(updateOptions, { where: { case_id: case_id } });
    }
};
