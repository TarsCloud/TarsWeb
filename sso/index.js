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
// const HttpController = require('../controller/http/HttpController');

const cwd = process.cwd();
const path = require('path');

const DemoLoginController = require('./app/controller/login/LoginController');
const DemoAuthController = require('./app/controller/auth/AuthController');
const DemoUserController = require('./app/controller/user/UserController');
const DemoTokenController = require('./app/controller/token/TokenController');
const DemoSetController = require('./app/controller/set/SetController');
const DemoLdapController = require('./app/controller/ldap/LdapController');

const { apiConf } = require(path.join(cwd, './app/router/routerConf.js'));

const ssoConf = [
    //登录注册接口
    ['post', '/register', DemoLoginController.register],
    ['post', '/login', DemoLoginController.login],
    ['get',  '/logout', DemoLoginController.logout],
    ['get', '/getUidByTicket', DemoLoginController.getUidByTicket],
    ['get', '/validate', DemoLoginController.validate],
    
    ['get', '/getLoginUid', DemoLoginController.getLoginUid],
    ['get', '/isEnableLogin', DemoLoginController.isEnableLogin],

    ['post', '/adminModifyPass', DemoUserController.adminModifyPass],
    ['get', '/isAdmin', DemoAuthController.isAdmin],

    // 是否启用LDAP
    ['get', '/isEnableLdap', DemoLdapController.isEnableLdap],

    //需要登录
    ['post', '/modifyPass', DemoUserController.modifyPass],
    ['get', '/getMyAuthList', DemoAuthController.getMyAuthList],

    //权限相关接口(从tars-web请求过来的, localhost默认开权限)
    ['get', '/auth/isAdmin', DemoAuthController.isAdmin],
    ['post', '/auth/addAuth', DemoAuthController.addAuth],
    ['post', '/auth/deleteAuth', DemoAuthController.deleteAuth],
    ['post', '/auth/updateAuth', DemoAuthController.updateAuth],
    ['get', '/auth/getAuthListByUid', DemoAuthController.getAuthListByUid],
    ['get', '/auth/getAuth', DemoAuthController.getAuth],
    ['get', '/auth/getAuthListByFlag', DemoAuthController.getAuthListByFlag],

    ['get', '/auth/getTokenList', DemoTokenController.getTokenList],
    ['post', '/auth/addToken', DemoTokenController.addToken],
    ['post', '/auth/deleteToken', DemoTokenController.deleteToken],
    ['post', '/auth/setTokenValid', DemoTokenController.setTokenValid],


    //登录且权限本地页面相关接口(必须是admin权限才可以操作, authMiddleware里面限制了)
    ['get', '/auth/page/getUserIdList', DemoUserController.getUserIdList],
    ['get', '/auth/page/getAuthList', DemoAuthController.getAuthList],
    ['post', '/auth/page/addAuth', DemoAuthController.addAuth],
    ['post', '/auth/page/pageDeleteAuth', DemoAuthController.pageDeleteAuth],
    ['post', '/auth/page/addUser', DemoUserController.addUser],
    ['post', '/auth/page/pageDeleteUser', DemoUserController.pageDeleteUser],

    ['get', '/auth/page/getSetList', DemoSetController.getSetList],
    ['post', '/auth/page/updateSet', DemoSetController.updateSet],
    ['post', '/auth/page/setSetValid', DemoSetController.setSetValid],

];

ssoConf.forEach(conf => apiConf.push(conf));
