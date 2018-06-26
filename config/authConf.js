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
 
//用户体系配置 auth.js
module.exports = {
    enableAuth: false,
    authUrlPrefix: 'http://localhost:3001',            //登录检验服务前缀host
    addAuthUrl: '/api/auth/addAuth',                   //新增权限url
    deleteAuthUrl: '/api/auth/deleteAuth',                //删除权限url
    updateAuthUrl: '/api/auth/updateAuth',
    getAuthListByUidUrl: '/api/auth/getAuthListByUid',
    getAuthListByFlagUrl: '/api/auth/getAuthListByFlag',
    getAuthUrl: '/api/auth/getAuth'
};