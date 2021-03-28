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
var path = require('path');

if (process.env.NODE_ENV == "dev") {
    module.exports = {
        dbType: 1,
        dbConf: {
            host: '127.0.0.1',       // 数据库地址
            port: '3306',            // 数据库端口
            user: 'tarsAdmin',            // 用户名
            password: 'Tars@2019',       // 密码
            charset: 'utf8',     // 数据库编码
            pool: {
                max: 10,             // 连接池中最大连接数量
                min: 0,              // 连接池中最小连接数量
                idle: 10000          // 如果一个线程 10 秒钟内没有被使用过的话，那么就释放线程
            }
        },
        webConf: {
            host: '127.0.0.1',
            port: 5001,              //服务启动端口
            loggerPath: path.join(__dirname, '../log'),    //本地日志的目录
            logFileKeepDays: '1',         //日志保留时间
            defaultLanguage: 'cn',    //cn 或 en ，用户默认的语言环境
            strict: false,              //true: tarslog模式(tarslog需要首先从框架上迁移走, 基础框架服务器上不能部署其他服务)
            uploadLogin: false,          //上传文件是否需要登录(开发或者调试时可以放开)
        },
        pkgUploadPath : {
            path : '/usr/local/app/patchs/tars.upload'
        },
        //防洪水攻击配置
        limitConf: {
            enableLimit: true,            //是否启用此配置
            limit: 5000,                  //限制访问的次数
            interval: 1000 * 60 * 10,     //限制的时间间隔，单位为ms，如：1小时内限制访问5000次
            whilteList: [],               //白名单IP
            blackList: []                 //黑名单IP
        },
        infTestConf:{
            tool: "/usr/local/tars/cpp/tools/tars2case",
            benchmarkAdmin:"benchmark.AdminServer.AdminObj"
        },
        ldapConf: {
            enableLDAP: false,                            // 是否启用LDAP用户登录验证
            url: 'ldap://ldap.dev.com:10389',           // LDAPServer地址
            basedn: 'ou=staff,dc=tars,dc=com',        // LDAP根目录|ou组织单位子目录|dc域名部分dc=upchina,dc=com为upchina.com
            reconnect: true,
            timeout: 30000,                              // LDAP创建client请求超时时间
            timeLimit: 30,                               // LDAPsearch超时时间，秒为单位
            syncAllUserSchedule: '*/5 * * * *',          // 全量同步LDAP用户,每5分钟同步一次
            maxInCache: 10 * 60 * 1000                   // 全量LDAP用户数据在内存中最大时间,应大于同步任务的时间
        }        
    };
    
} else {
    module.exports = {
        dbType: 1,
        dbConf: {
            host: 'db.tars.com',       // 数据库地址
            port: '3306',            // 数据库端口
            user: 'tars',            // 用户名
            password: 'tars2015',       // 密码
            charset: 'utf8',     // 数据库编码
            pool: {
                max: 10,             // 连接池中最大连接数量
                min: 0,              // 连接池中最小连接数量
                idle: 10000          // 如果一个线程 10 秒钟内没有被使用过的话，那么就释放线程
            }
        },
        webConf: {
            host: 'localip.tars.com',
            port: 3000,              //服务启动端口
            loggerPath: path.join(__dirname, '../log'),    //本地日志的目录
            logFileKeepDays: '1',         //日志保留时间
            defaultLanguage: 'cn',    //cn 或 en ，用户默认的语言环境
            strict: false,              //true: tarslog模式(tarslog需要首先从框架上迁移走, 基础框架服务器上不能部署其他服务)
            uploadLogin: false,          //上传文件是否需要登录(开发或者调试时可以放开)
        },
        pkgUploadPath: {
            path: '/usr/local/app/patchs/tars.upload'
        },
        //防洪水攻击配置
        limitConf: {
            enableLimit: true,            //是否启用此配置
            limit: 5000,                  //限制访问的次数
            interval: 1000 * 60 * 10,     //限制的时间间隔，单位为ms，如：1小时内限制访问5000次
            whilteList: [],               //白名单IP
            blackList: []                 //黑名单IP
        },
        infTestConf:{
            tool: "/usr/local/tars/cpp/tools/tars2case",
            benchmarkAdmin:"benchmark.AdminServer.AdminObj"
        },
        ldapConf: {
            enableLDAP: false,                            // 是否启用LDAP用户登录验证
            url: 'ldap://ldap.tars.com:10389',           // LDAPServer地址
            basedn: 'ou=staff,dc=tars,dc=com',        // LDAP根目录|ou组织单位子目录|dc域名部分dc=tars,dc=com为tars.com
            reconnect: true,
            timeout: 30000,                              // LDAP创建client请求超时时间
            timeLimit: 30,                               // LDAPsearch超时时间，秒为单位
            syncAllUserSchedule: '*/5 * * * *',          // 全量同步LDAP用户,每5分钟同步一次
            maxInCache: 10 * 60 * 1000                   // 全量LDAP用户数据在内存中最大时间,应大于同步任务的时间
        }        
    };

}
