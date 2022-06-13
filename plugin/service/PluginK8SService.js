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

const PluginService = {};

PluginService.listInstall = async (paramsObj) => {

    let tPlugin = await CommonService.getObject("tplugins", CommonService.getMetadataName(paramsObj.obj.toLowerCase()));

    let result;

    if (!tPlugin) {
        tPlugin = tPlugin.body;
        tPlugin.spec = {
            name: paramsObj.name,
            name_en: paramsObj.name_en,
            obj: paramsObj.obj,
            type: paramsObj.type,
            path: paramsObj.path
        };

        result = await CommonService.replaceObject("tplugins", tPlugin);

    } else {
        tPlugin = {
            apiVersion: CommonService.GROUP + '/' + CommonService.VERSION,
            kind: 'TPlugin',
            metadata: {
                namespace: CommonService.NAMESPACE,
            },
        }
        tPlugin.spec = {
            name: paramsObj.name,
            name_en: paramsObj.name_en,
            obj: paramsObj.obj,
            type: paramsObj.type,
            path: paramsObj.path
        }

        result = await CommonService.createObject("tplugins", tPlugin);
    }

    return {
        ret: 200,
        msg: 'succ',
        data: result.body
    };

}

PluginService.loadPlugins = async (app) => {

    try {
        let plugins = await CommonService.listObject("tplugins");

        // console.log("loadPlugins", plugins);

        if (plugins.items) {
            plugins.items.forEach(async (plugin) => {

                let target = await findActiveIndex(plugin.f_obj);

                if (target) {

                    app.use(proxy(`${plugin.f_path}`, {
                        target: target,
                        ws: true,
                        changeOrigin: true
                    }));
                }
            });
        }
    } catch (e) {

    }

    setTimeout(() => {
        PluginService.loadPlugins(app);
    }, 5000);

}

module.exports = PluginService;