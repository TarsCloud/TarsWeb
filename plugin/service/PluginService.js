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
const webConf = require('../../config/webConf');
const PluginService = {};

const _ = require('lodash');

let thisApp = null;

PluginService.list = async (type) => {

    let rst = await PluginDao.listPlugins(type);

    return {
        ret: 200,
        msg: 'succ',
        data: rst
    };
}

PluginService.listAll = async () => {

    let rst = await PluginDao.listPlugins();

    return {
        ret: 200,
        msg: 'succ',
        data: rst
    };
}

PluginService.delete = async (id) => {

    let rst = await PluginDao.deletePlugin(id);

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
            return `${activeList.at(0).host}:${activeList.at(0).port}`;
        }

        activeList = rst.response.arguments.inactiveEp;

        if (activeList.length > 0) {
            return `${activeList.at(0).host}:${activeList.at(0).port}`;
        }

        return null;
    } catch (e) {
        console.log('findActiveIndex', e);
        return null;
    }
}

let allPlugins = {}

PluginService.loadPlugins = async (app) => {

    let plugins = [];

    try {
        plugins = await PluginDao.listPlugins();
    } catch (e) {
        logger.error(e.message);
    }

    plugins.forEach(async (plugin) => {

        if (plugin.f_extern == 0) {
            let target = await findActiveIndex(plugin.f_obj);

            logger.info(target);

            if (target) {

                if (allPlugins[plugin.f_path] != target) {

                    let headers = {};
                    let ws = true;
                    if (process.env.TARS_RESID) {

                        ws = false;
                        headers = {
                            ns: process.env.TARS_RESID,
                            host: target,
                        }

                        target = process.env.TARS_DEPOSIT;

                    }
                    else {
                        target = "http://" + target;
                    }

                    app.use(proxy(plugin.f_path, {
                        target: target,
                        ws: ws,
                        changeOrigin: true,
                        headers: headers
                    }));

                    allPlugins[plugin.f_path] = target;
                }
            }
        }
    });

    setTimeout(() => {
        PluginService.loadPlugins(app);
    }, 5000);
}

PluginService.load = async () => {

    PluginService.loadPlugins(thisApp);

    return {
        ret: 200,
        msg: 'succ',
        data: {}
    };
}

module.exports = PluginService;