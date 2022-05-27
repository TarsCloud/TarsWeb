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

const logger = require('../../logger');
const PluginDao = require('../../app/dao/PluginDao');

const registry = require("../../rpc").registry
const proxy = require('koa-server-http-proxy');

const PluginService = {};

const _ = require('lodash');

PluginService.install = async (paramsObj) => {

    return await PluginDao.install(paramsObj);
}

PluginService.list = async (type) => {

    let rst = await PluginDao.listPlugins(type);

    return {
        ret: 200,
        msg: 'succ',
        data: rst
    };
}

async function findActiveIndex(obj) {
    try {
        let rst = await registry.findObjectById4Any(obj);

        // console.log(obj, rst.response.arguments);

        activeList = rst.response.arguments.activeEp;

        if (activeList.length > 0) {
            return `http://${activeList.at(0).host}:${activeList.at(0).port}`;
        }

        activeList = rst.response.arguments.inactiveEp;

        if (activeList.length > 0) {
            return `http://${activeList.at(0).host}:${activeList.at(0).port}`;
        }

        return null;
    } catch (e) {
        console.log('findActiveIndex', e);
        return null;
    }
}

PluginService.loadPlugins = async (app) => {

    let plugins = await PluginDao.listPlugins();

    plugins.forEach(async (plugin) => {

        // console.log("plugin:", plugin);

        let target = await findActiveIndex(plugin.f_obj);

        console.log("target:", target);
        if (target) {

            if (process.env.NODE_ENV != "production") {
                if (plugin.f_path == "/plugins/base/benchmark") {
                    app.use(proxy(plugin.f_path, {
                        target: "http://127.0.0.1:8188",
                        ws: true,
                        changeOrigin: true
                    }));
                }
            }
        } else {
            app.use(proxy(`${plugin.f_path}`, {
                target: target,
                ws: true,
                changeOrigin: true
            }));
        }
    });

    setTimeout(() => {
        PluginService.loadPlugins(app);
    }, 5000);
}

module.exports = PluginService;