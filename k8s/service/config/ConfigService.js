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

// const moment = require('moment');
const CommonService = require('../common/CommonService');
var crypto = require('crypto');

const ConfigService = {};

ConfigService.getConfId = (...args) => {

    let configId = '';

    for (let i = 0; i < args.length; i++) {

        if (args[i] != null) {
            // 特殊处理：默认第3个字段是configName，需要hash处理避免无效字符串
            configId += args[i]
            configId += "-"
        }
    }

    configId += (new Date()).getTime() + '-' + Math.random();

    configId = crypto.createHash('md5').update(configId).digest("hex")

    return configId.toLowerCase();
}

ConfigService.buildTConfig = (metadata) => {

    let tConfig = {
        apiVersion: CommonService.GROUP + '/' + CommonService.VERSION,
        kind: 'TConfig',
        metadata: {
            namespace: CommonService.NAMESPACE,
        },
    }

    if (metadata.PodSeq) {
        // 节点配置
        if (!metadata.ServerApp || !metadata.ServerName) {
            return {
                ret: 500,
                msg: "Bad Schema : Bad Params.Metadata.PodSeq Value"
            };
        }
        tConfig.metadata.name = ConfigService.getConfId(metadata.ServerApp, metadata.ServerName, metadata.ConfigName, metadata.PodSeq)

        Object.assign(tConfig, {
            app: metadata.ServerApp,
            server: metadata.ServerName,
            configName: metadata.ConfigName,
            configContent: metadata.ConfigContent,
            podSeq: metadata.PodSeq,
            updateTime: new Date(),
            updatePerson: metadata.Uid,
            updateReason: metadata.ConfigMark || "create",
            activated: true,
        });

    } else if (metadata.ServerName) {
        // 服务配置
        if (!metadata.ServerApp) {
            return {
                ret: 500,
                msg: "Bad Schema : Bad Params.Metadata.ServerName Value."
            };
        }
        tConfig.metadata.name = ConfigService.getConfId(metadata.ServerApp, metadata.ServerName, metadata.ConfigName)

        Object.assign(tConfig, {
            app: metadata.ServerApp,
            server: metadata.ServerName,
            configName: metadata.ConfigName,
            configContent: metadata.ConfigContent,
            updateTime: new Date(),
            updatePerson: metadata.Uid,
            updateReason: metadata.ConfigMark || "create",
            activated: true,
        });
    } else if (metadata.ServerApp) {
        // 应用配置
        tConfig.metadata.name = ConfigService.getConfId(metadata.ServerApp, null, metadata.ConfigName)
        Object.assign(tConfig, {
            app: metadata.ServerApp,
            server: "",
            configName: metadata.ConfigName,
            configContent: metadata.ConfigContent,
            updateTime: new Date(),
            updatePerson: metadata.Uid,
            updateReason: metadata.ConfigMark || "create",
            activated: true,
        });
    } else {
        if (!metadata.ServerApp) {
            return {
                ret: 500,
                msg: "Bad Schema : Bad Params.Metadata.ServerApp Value."
            };
        }
    }

    return {
        ret: 200,
        msg: "succ",
        data: tConfig
    };
}

ConfigService.serverConfigCreate = async (metadata) => {

    let data = ConfigService.buildTConfig(metadata)

    if (data.ret != 200) {
        return data;
    }

    let result = await CommonService.createObject("tconfigs", data.data);

    return {
        ret: 200,
        msg: 'succ',
        data: result.body
    };
}

ConfigService.serverConfigSelect = async (filter) => {

    let labelSelector = CommonService.createLabelSelector(filter);
    if (labelSelector != '') {
        labelSelector += ',';
    }

    //主配置, 标签是m
    if (filter.eq[CommonService.TConfigNameLabel]) {
        labelSelector += CommonService.TConfigPodSeqLabel + "!=m"
    } else {
        labelSelector += CommonService.TConfigPodSeqLabel + "=m";
    }

    labelSelector += "," + CommonService.TConfigActivated + "=true";

    let allItems = await CommonService.listObject("tconfigs", labelSelector);
    allItems = allItems.body.items;

    // filter
    let filterItems = allItems;

    if (filter != null) {
        filterItems = [];

        allItems.forEach(elem => {
            filterItems.push(elem);
        });
    }

    // Count填充
    let result = {};

    // Data填充
    result.Data = [];
    filterItems.forEach(item => {

        let elem = {};
        elem["ConfigId"] = item.metadata.name

        elem["ServerId"] = CommonService.getServerId(item.app, item.server)
        if (item.podSeq != null) {
            elem["PodSeq"] = item.podSeq
        } else {
            elem["PodSeq"] = ""
        }
        elem["ConfigName"] = item.configName
        elem["ConfigContent"] = item.configContent
        elem["CreateTime"] = item.updateTime
        elem["CreatePerson"] = item.updatePerson
        elem["ConfigMark"] = item.updateReason
        elem["ConfigVersion"] = item.version;

        result.Data.push(elem);
    });

    result.Data.sort((a, b) => {
        if (a.ConfigName == b.ConfigName) {
            return 0;
        }

        return a.ConfigName < b.ConfigName ? -1 : 1;
    })

    return {
        ret: 200,
        msg: 'succ',
        data: result
    };

}

ConfigService.serverConfigUpdate = async (metadata, target) => {

    let tConfig = await CommonService.getObject("tconfigs", metadata.ConfigId);
    if (!tConfig) {
        return {
            ret: 500,
            msg: "config not exists"
        };
    }

    tConfig = tConfig.body;

    metadata.ServerApp = tConfig.app;
    metadata.ServerName = tConfig.server;
    metadata.ConfigName = tConfig.configName;
    metadata.ConfigContent = target.ConfigContent;
    metadata.PodSeq = tConfig.podSeq;

    return ConfigService.serverConfigCreate(metadata);
}

ConfigService.serverConfigDelete = async (metadata) => {

    await CommonService.deleteObject("tconfigs", metadata.ConfigId);

    return {
        ret: 200,
        msg: 'succ'
    };
}

ConfigService.serverConfigContent = async (metadata) => {

    let filter = {
        eq: {},
    }

    filter.eq[CommonService.TServerAppLabel] = metadata.ServerApp;
    filter.eq[CommonService.TServerNameLabel] = metadata.ServerName;
    filter.eq[CommonService.TConfigNameLabel] = metadata.ConfigName;
    filter.eq[CommonService.TConfigPodSeqLabel] = "m";
    filter.eq[CommonService.TConfigActivated] = "true";

    let labelSelector = CommonService.createLabelSelector(filter);

    let serverConfigItems = await CommonService.listObject("tconfigs", labelSelector);
    if (serverConfigItems.body.items.length == 0) {
        return {
            ret: 500,
            msg: "config not exists"
        };
    }

    let tServerConfig = serverConfigItems.body.items[0];

    filter.eq[CommonService.TConfigPodSeqLabel] = metadata.PodSeq;

    labelSelector = CommonService.createLabelSelector(filter);

    let podConfigItems = await CommonService.listObject("tconfigs", labelSelector);

    if (podConfigItems.body.items.length == 0) {
        return {
            ret: 500,
            msg: "pod config not exists"
        };
    }

    let tPodConfig = podConfigItems.body.items[0];

    let result = tServerConfig.configContent + "\r\n" + tPodConfig.configContent;

    return {
        ret: 200,
        msg: 'succ',
        data: result
    };

}

ConfigService.serverConfigHistroySelect = async (ConfigId) => {

    let tConfig = await CommonService.getObject("tconfigs", ConfigId);

    tConfig = tConfig.body;

    delete tConfig.metadata.labels[CommonService.TConfigVersion];
    tConfig.metadata.labels[CommonService.TConfigActivated] = "false";

    let filter = {};
    filter.eq = tConfig.metadata.labels;

    filter.eq[CommonService.TServerAppLabel] = tConfig.metadata.labels[CommonService.TServerAppLabel];
    filter.eq[CommonService.TServerNameLabel] = tConfig.metadata.labels[CommonService.TServerNameLabel];
    filter.eq[CommonService.TConfigNameLabel] = tConfig.metadata.labels[CommonService.TConfigNameLabel];
    filter.eq[CommonService.TConfigPodSeqLabel] = tConfig.metadata.labels[CommonService.TConfigPodSeqLabel];

    let labelSelector = CommonService.createLabelSelector(filter);

    let allItems = await CommonService.listObject("tconfigs", labelSelector);
    allItems = allItems.body.items;

    // filter
    let filterItems = allItems;

    // Count填充
    let result = {};

    // Data填充
    result.Data = [];
    filterItems.forEach(item => {

        console.log(item);

        let elem = {};
        elem["ConfigId"] = item.metadata.name

        elem["ServerId"] = CommonService.getServerId(item.app, item.server)
        if (item.podSeq != null) {
            elem["PodSeq"] = item.podSeq
        } else {
            elem["PodSeq"] = ""
        }
        elem["ConfigName"] = item.configName
        elem["ConfigContent"] = item.configContent
        elem["CreateTime"] = item.metadata.creationTimestamp
        elem["CreatePerson"] = item.updatePerson
        elem["ConfigMark"] = item.updateReason
        elem["ConfigVersion"] = item.version;

        result.Data.push(elem);
    });

    result.Data.sort((a, b) => {
        if (a.CreateTime == b.CreateTime) {
            return 0;
        }

        return a.CreateTime < b.CreateTime ? 1 : -1;
    })

    return {
        ret: 200,
        msg: 'succ',
        data: result
    };
}

ConfigService.serverConfigHistroyDelete = async (metadata) => {

    await CommonService.deleteObject("tconfigs", metadata.ConfigId);

    return {
        ret: 200,
        msg: 'succ'
    };
}

ConfigService.serverConfigHistoryBack = async (metadata) => {

    let tConfig = await CommonService.getObject("tconfigs", metadata.HistoryId);
    if (!tConfig) {
        return {
            ret: 500,
            msg: "config not exists"
        };
    }

    tConfig = tConfig.body;

    tConfig.activated = true;

    let result = await CommonService.replaceObject("tconfigs", metadata.HistoryId, tConfig);

    return {
        ret: 200,
        msg: 'succ',
        data: result.body
    };
}


module.exports = ConfigService;