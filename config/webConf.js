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

module.exports = {
    dbConf: {
        host: 'db.tars.com',       // 数据库地址
        port: '3306',            // 数据库端口
        user: 'tars',            // 用户名
        password: 'tars2015',       // 密码
        charset: 'utf8_bin',     // 数据库编码
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
    kafkaConf : {
        enable : false,
        kafkaHost : 'localhost:9092',
        zkHost : 'localhost:2181',
        topic : 'tarsTask',
        maxCount : 100              // 后台并行处理的最大任务数
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
    }
};
