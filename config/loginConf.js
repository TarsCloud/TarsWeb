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
let request = require('request-promise-any');
const logger = require('../app/logger');

/**
 * 登录配置
 */
module.exports = {
    enableLogin: true,                     //是否启用登录验证
    defaultLoginUid: 'admin',                //若不启用登录验证，默认用户为admin
    redirectUrlParamName: 'redirect_url',    //跳转到登录url的时带的原url参数名，如：***/login?service=***，默认是service
    baseUserCenterUrl: 'http://localhost:3001',   //登录跳转url(代码中要替换localhost)
    baseLoginUrl: 'http://localhost:3001/login.html',                 //登录跳转url(userCenterUrl + loginUrl)
    userCenterUrl: '',                      //登录跳转url(代码中要替换baseUserCenterUrl:localhost)
    loginUrl: '',                           //登录跳转url(baseLoginUrl:localhost)
    logoutUrl: '',
    logoutredirectUrlParamName: 'url',
    ticketCookieName: 'ticket',             //cookie中保存ticket信息的cookie名
    uidCookieName: 'uid',                   //cookie中保存用户信息的cookie名
    cookieDomain: '',              //cookie值对应的域
    ticketParamName: 'ticket',              //第三方登录服务回调时候，url中表示st的参数名
    getUidByTicket: getUidByTicket,         //通过ticket从cas服务端校验和获取用户基本信息的url,或获取用户基本信息的方法
    getUidByTicketParamName: 'ticket',      //调用获取用户信息接口时候st的参数名
    uidKey: 'data.uid',                     //结果JSON里面取出用户名的位置，取到该用户名才认为成功,可以多层
    validate: validate,                     //通过token和用户名到cas服务端校验key和用户名是否匹配的url或方法
    validateTicketParamName: 'ticket',      //校验接口传入st参数名
    validateUidParamName: 'uid',            //校验接口传入用户参数名
    validateMatch: [
        ['data.result', true]
    ],                                      //校验通过匹配条件，可以从多层结果，多个情况
    ignore: ['/static', '/api'], //不需要登录校验的路径
    ignoreIps: [],                           //访问ip白名单
    apiPrefix: ['/pages/server/api'],       //接口相应的路径前缀，这类接口访问不直接跳转到登录界面，而只是提示未登录
    apiNotLoginMes: '#common.noLogin#', //接口无登录权限的提示语
};

/**
 * 由用户直接定制通过ticket获取用户信息的方法
 * @param ctx
 */
async function getUidByTicket(ctx, ticket){
    //TODO
    return new Promise((resolve, reject)=>{
        try{
            request.get('http://localhost:3001/api/getUidByTicket?ticket='+ticket).then(uidInfo=>{
                logger.info(ctx.url, 'getUidByTicket', ticket, uidInfo);

                uidInfo = JSON.parse(uidInfo);
                resolve(uidInfo.data.uid);
            }).catch(err=>{
                reject(err);
            })
        }catch(e){
            resolve(false)
        }
    })
}

/**
 * 由用户直接定制判断用户名校验方法
 * @param ctx
 */
async function validate(ctx, uid, ticket){
    //TODO
    return new Promise((resolve, reject)=>{
        try{
            request.get('http://localhost:3001/api/getUidByTicket?ticket='+ticket).then(uidInfo=>{

                uidInfo = JSON.parse(uidInfo);

                logger.info(ctx.url, 'validate uidInfo', uidInfo, uid);

                uid = uidInfo.data.uid;
                resolve(uidInfo.data.uid);

            }).catch(err=>{
                logger.info(ctx.url, 'validate', err);
                reject(err);
            })
        }catch(e){
            reject(false)
        }
    })
}
