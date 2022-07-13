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
const CommonService = require("../../k8s/service/common/CommonService");
const registry = require("../../rpc/k8s").registry
const proxy = require('koa-server-http-proxy');

const PluginService = {};

let thisApp = null;

PluginService.install = async (paramsObj) => {

    let name = paramsObj.obj.toLowerCase();

    let tPlugin = await CommonService.getObject("tplugins", name);

    let result;

    if (tPlugin) {
        tPlugin = tPlugin.body;
        tPlugin.metadata.labels = tPlugin.metadata.labels || {};
        tPlugin.metadata.labels["type"] = "" + paramsObj.type;
        tPlugin.spec = {
            name: paramsObj.name,
            name_en: paramsObj.name_en,
            obj: paramsObj.obj,
            type: paramsObj.type,
            path: paramsObj.path,
            extern: paramsObj.extern || 0
        };

        result = await CommonService.replaceObject("tplugins", name, tPlugin);

    } else {
        tPlugin = {
            apiVersion: CommonService.GROUP + '/' + CommonService.VERSION,
            kind: 'TPlugin',
            metadata: {
                namespace: CommonService.NAMESPACE,
                name: name,
                labels: {
                    type: "" + paramsObj.type
                }
            },
        }
        tPlugin.spec = {
            name: paramsObj.name,
            name_en: paramsObj.name_en,
            obj: paramsObj.obj,
            type: paramsObj.type,
            path: paramsObj.path,
            extern: paramsObj.extern || 0
        }

        result = await CommonService.createObject("tplugins", tPlugin);
    }

    return {
        ret: 200,
        msg: 'succ',
        data: result.body
    };

}

PluginService.list = async (type) => {

    let plugins = await CommonService.listObject("tplugins", "type=" + type);

    let data = [];

    if (plugins) {
        plugins.body.items.forEach(i => {
            data.push({
                f_id: i.metadata.name,
                f_name: i.spec.name,
                f_name_en: i.spec.name_en,
                f_obj: i.spec.obj,
                f_type: i.spec.type,
                f_path: i.spec.path,
                f_extern: i.spec.extern || 0,
            });
        })
    }

    return {
        ret: 200,
        msg: 'succ',
        data: data
    };
}

PluginService.listAll = async () => {

    let plugins = await CommonService.listObject("tplugins");

    let data = [];

    if (plugins) {
        plugins.body.items.forEach(i => {
            data.push({
                f_id: i.metadata.name,
                f_name: i.spec.name,
                f_name_en: i.spec.name_en,
                f_obj: i.spec.obj,
                f_type: i.spec.type,
                f_path: i.spec.path,
                f_extern: i.spec.extern || 0,
            });
        })
    }

    return {
        ret: 200,
        msg: 'succ',
        data: data
    };
}

PluginService.delete = async (id) => {

    await CommonService.deleteObject("tplugins", id);


    return {
        ret: 200,
        msg: 'succ',
        data: {}
    };
}


async function findActiveIndex(obj) {
    try {
        // console.log(obj);

        let rst = await registry.findObjectById4Any(obj);

        logger.info(obj, rst.response.arguments.activeEp.toObject());

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
        logger.error('findActiveIndex', e.message);
        return null;
    }
}

PluginService.loadPlugins = async (app) => {

    thisApp = app;

    try {
        let plugins = await CommonService.listObject("tplugins");

        // console.log("loadPlugins", plugins);

        if (plugins) {
            plugins.body.items.forEach(async (plugin) => {

                // logger.info(plugin);
                if (plugin.spec.extern != 1) {

                    let target = await findActiveIndex(plugin.spec.obj);

                    if (target) {

                        app.use(proxy(plugin.spec.path, {
                            target: target,
                            ws: true,
                            changeOrigin: true
                        }));
                    }
                }
            });

        }
    } catch (e) {
        logger.error(e.message);
    }

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