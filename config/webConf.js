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
const cwd = process.cwd();
const path = require('path');
const fs = require('fs-extra');

let conf = {
    ENABLE_LOCAL_CONFIG: false,
    webConf: {
        host: 'localip.tars.com',
        port: 3000, //服务启动端口
        loggerPath: path.join(__dirname, '../log'), //本地日志的目录
        logFileKeepDays: '1', //日志保留时间
        defaultLanguage: 'cn', //cn 或 en ，用户默认的语言环境
        strict: false, //true: tarslog模式(tarslog需要首先从框架上迁移走, 基础框架服务器上不能部署其他服务)
        uploadLogin: false, //上传文件是否需要登录(开发或者调试时可以放开)
        alter: true, //变更db结构
    },
    batchServer: {
        exportPath: "/usr/local/app/patchs/export",
        importPath: "/usr/local/app/patchs/import"
    },
    pkgUploadPath: {
        path: '/usr/local/app/patchs/tars.upload'
    },
    //防洪水攻击配置
    limitConf: {
        enableLimit: true, //是否启用此配置
        limit: 5000, //限制访问的次数
        interval: 1000 * 60 * 10, //限制的时间间隔，单位为ms，如：1小时内限制访问5000次
        whilteList: [], //白名单IP
        blackList: [] //黑名单IP
    },
    infTestConf: {
        tool: "/usr/local/tars/cpp/tools/tars2case",
        benchmarkAdmin: "benchmark.AdminServer.AdminObj"
    },
    ldapConf: {
        enableLDAP: false, // 是否启用LDAP用户登录验证
        url: 'ldap://ldap.tars.com:10389', // LDAPServer地址
        basedn: 'ou=starsf,dc=tars,dc=com', // LDAP根目录|ou组织单位子目录|dc域名部分dc=tars,dc=com为tars.com
        reconnect: true,
        timeout: 30000, // LDAP创建client请求超时时间
        timeLimit: 30, // LDAPsearch超时时间，秒为单位
        syncAllUserSchedule: '*/5 * * * *', // 全量同步LDAP用户,每5分钟同步一次
        maxInCache: 10 * 60 * 1000 // 全量LDAP用户数据在内存中最大时间,应大于同步任务的时间
    },
    dbConf: {
        host: 'db.tars.com', // 数据库地址
        port: '3306', // 数据库端口
        user: 'tars', // 用户名
        password: 'tars2015', // 密码
        charset: 'utf8', // 数据库编码
        pool: {
            max: 10, // 连接池中最大连接数量
            min: 0, // 连接池中最小连接数量
            idle: 10000 // 如果一个线程 10 秒钟内没有被使用过的话，那么就释放线程
        }
    },
    client: path.join(cwd, 'config/tars.conf'), //连接普通TARS环境的配置
    enable: true, //启用普通的版本
    show: true, //显示TARS tab

    k8s: {
        client: path.join(cwd, 'config/k8s.conf'), //连接k8s环境里面tars配置
        namespace: 'tars-dev',
        apiPrefix: 'apis/k8s.tars.io/v1beta2', // 与k8s的交互配置
        uploadDomain: 'http://tars-tarsimage/api/v1beta2/timage', // tarsimage上传交互
        cache: true, //从cache中加载
    },
    market: false,
    isEnableK8s: () => {
        return process.env.ENABLE_K8S == "true" || false;
    },

};

if (process.env.NODE_ENV == "local") {

    conf.dbConf = {
        host: '127.0.0.1', // 数据库地址
        port: '3306', // 数据库端口
        user: 'tarsAdmin', // 用户名
        password: 'Tars@2019', // 密码
        charset: 'utf8', // 数据库编码
        pool: {
            max: 10, // 连接池中最大连接数量
            min: 0, // 连接池中最小连接数量
            idle: 10000 // 如果一个线程 10 秒钟内没有被使用过的话，那么就释放线程
        }
    };

    conf.webConf.host = '0.0.0.0';
    conf.webConf.port = 4001;
    conf.webConf.alter = false;
    conf.market = true;

    conf.client = path.join(cwd, 'config/tars-dev.conf');
    process.env.ENABLE_K8S = "false";

} else if (process.env.NODE_ENV == "remote") {

    conf.dbConf = {
        host: '172.30.0.4', // 数据库地址
        port: '3306', // 数据库端口
        user: 'tarsAdmin', // 用户名
        password: 'Tars@2019', // 密码
        charset: 'utf8', // 数据库编码
        pool: {
            max: 10, // 连接池中最大连接数量
            min: 0, // 连接池中最小连接数量
            idle: 10000 // 如果一个线程 10 秒钟内没有被使用过的话，那么就释放线程
        }
    };

    conf.webConf.host = '0.0.0.0';
    conf.webConf.port = 3000;
    conf.webConf.alter = true;

    conf.client = path.join(cwd, 'config/tars-remote.conf');
    process.env.ENABLE_K8S = "false";

} else if (process.env.NODE_ENV == "dev") {

    conf.dbConf = {
        host: '172.16.8.227', // 数据库地址
        port: '3307', // 数据库端口
        user: 'tarsAdmin', // 用户名
        password: 'Tars@2019', // 密码
        charset: 'utf8', // 数据库编码
        pool: {
            max: 10, // 连接池中最大连接数量
            min: 0, // 连接池中最小连接数量
            idle: 10000 // 如果一个线程 10 秒钟内没有被使用过的话，那么就释放线程
        }
    };


    conf.webConf.host = '0.0.0.0';
    conf.webConf.port = 4001;
    conf.webConf.alter = true;

    conf.client = path.join(cwd, 'config/tars-dev.conf');
    process.env.ENABLE_K8S = "false";

} else if (process.env.NODE_ENV == "k8s") {

    conf.dbConf = null;

    conf.webConf.host = '0.0.0.0';
    conf.webConf.port = 4001;

    conf.client = path.join(cwd, 'config/tars-k8s.conf');

    process.env.ENABLE_K8S = "true";
    conf.enable = false;
    // conf.market = true;
    conf.k8s.namespace = 'tars-dev';
    conf.k8s.uploadDomain = 'http://127.0.0.1:18080/api/v1beta1/timage';
} else if (process.env.NODE_ENV == "all") {

    conf.ENABLE_LOCAL_CONFIG = true;
    conf.dbConf = {
        host: '127.0.0.1', // 数据库地址
        port: '3306', // 数据库端口
        user: 'tarsAdmin', // 用户名
        password: 'Tars@2019', // 密码
        charset: 'utf8', // 数据库编码
        pool: {
            max: 10, // 连接池中最大连接数量
            min: 0, // 连接池中最小连接数量
            idle: 10000 // 如果一个线程 10 秒钟内没有被使用过的话，那么就释放线程
        }
    };
    conf.webConf.host = '0.0.0.0';
    conf.webConf.port = 4001;

    conf.client = path.join(cwd, 'config/tars-dev.conf');

    process.env.ENABLE_K8S = "true";
    conf.enable = true;
    conf.market = true;
    conf.webConf.alter = false;
    conf.k8s.namespace = 'tars-dev';
    conf.k8s.uploadDomain = 'http://127.0.0.1:18080/api/v1beta1/timage';
}

module.exports = conf;