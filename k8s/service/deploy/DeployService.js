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
const logger = require('../../../logger');
const CommonService = require('../common/CommonService');
const ApplicationService = require('../application/ApplicationService');
const ImageService = require('../image/ImageService');
const ConfigService = require('../config/ConfigService');

const lodash = require("lodash");
const DeployService = {};

DeployService.install = async (deploy, ServerServant, ServerK8S, ServerOption, source) => {

    {
        let metadata = {
            ServerApp: deploy.app,
            BusinessName: '',
            AppMark: '',
        }
        await ApplicationService.applicationCreate(metadata);
    }

    let mark = source ? "cloud" : "manual";

    //创建配置文件
    {
        let appConfig = deploy.appConfig || [];

        for (let i = 0; i < appConfig.length; i++) {

            let conf = appConfig[i];

            const metadata = {
                ConfigName: conf.name,
                ConfigContent: conf.content,
                ConfigMark: mark
            }

            metadata.ServerApp = deploy.app;

            metadata.Uid = deploy.uid;

            await ConfigService.serverConfigCreate(metadata);
        }

        let config = deploy.config || [];

        for (let i = 0; i < config.length; i++) {
            let conf = config[i];
            const metadata = {
                ConfigName: conf.name,
                ConfigContent: conf.content,
                ConfigMark: mark
            }

            metadata.ServerApp = deploy.app;
            metadata.ServerName = deploy.server;

            metadata.Uid = deploy.uid;

            await ConfigService.serverConfigCreate(metadata);
        }

        let nodeConfig = deploy.nodeConfig || [];

        for (let i = 0; i < nodeConfig.length; i++) {

            let conf = nodeConfig[i];

            const metadata = {
                ConfigName: conf.name,
                ConfigContent: conf.content,
                ConfigMark: mark
            }

            metadata.ServerApp = deploy.app;
            metadata.ServerName = deploy.server;

            metadata.PodSeq = deploy.podSeq;

            metadata.Uid = deploy.uid;

            await ConfigService.serverConfigCreate(metadata);

        }
    }

    let exists = false;
    let tServer = await CommonService.getServer(deploy.app + '.' + deploy.server);

    if (!tServer) {
        //创建服务
        tServer = await CommonService.buildTServer(deploy.app, deploy.server, ServerServant, ServerK8S, ServerOption);
    } else {
        exists = true;
        tServer = tServer.body;
    }

    if (source) {
        tServer.metadata.labels = tServer.metadata.labels || {};
        if (source[CommonService.TServerCloudProduct]) {
            tServer.metadata.labels[CommonService.TServerCloudInstall] = "product";
        } else {
            tServer.metadata.labels[CommonService.TServerCloudInstall] = "service";
        }
        tServer.metadata.annotations = tServer.metadata.annotations || {};
        tServer.metadata.annotations[CommonService.TServerCloudInstall] = JSON.stringify(source);

    }

    let K8S = tServer.spec.k8s

    if (deploy.resources) {
        //resource
        K8S.resources = {}
        //k8s资源管理
        if (deploy.resources.limitCpu || deploy.resources.limitMem) {
            K8S.resources.limits = {}
            if (deploy.resources.limitCpu) K8S.resources.limits.cpu = deploy.resources.limitCpu
            if (deploy.resources.limitMem) K8S.resources.limits.memory = deploy.resources.limitMem
        }
        if (deploy.resources.requestCpu || deploy.resources.requestMem) {
            K8S.resources.requests = {}
            if (deploy.resources.requestCpu) K8S.resources.requests.cpu = deploy.resources.requestCpu
            if (deploy.resources.requestMem) K8S.resources.requests.memory = deploy.resources.requestMem
        }
        if (Object.keys(K8S.resources).length == 0) {
            delete K8S.resources
        }
    }

    //disk mounts
    if (deploy.mounts) {
        let mounts = [];
        if (K8S.mounts) {
            K8S.mounts.forEach(item => {
                if (!item.source.hasOwnProperty("tLocalVolume")) {
                    mounts.push(item)
                }
            })
        }
        deploy.mounts.forEach(item => {
            let tLocalVolume = item.source.tLocalVolume
            item.source.tLocalVolume = {
                uid: tLocalVolume.uid || "0",
                gid: tLocalVolume.gid || "0",
                mode: tLocalVolume.mode || "755"
            }
            mounts.push(item)
        })
        K8S.mounts = mounts;
    }

    //web部署, image可能不存在, 只是用来占位
    if (deploy.repo.image) {
        //创建timages
        deploy.repo.id = "v-" + (new Date()).getTime();

        let tImage = await ImageService.serverImageCreateWithRelease(deploy, mark);
        if (tImage.ret != 200) {
            logger.error("createServerWithImage serverImageGetAndCreate error:", rst);
            return rst;
        }

        //发布记录
        tServer.spec.release = {};
        tServer.spec.release.id = deploy.repo.id;
        tServer.spec.release.image = deploy.repo.image;
        tServer.spec.release.secret = deploy.repo.secret;
    }

    let data;

    if (exists) {
        data = await CommonService.replaceObject("tservers", CommonService.getTServerName(deploy.app + '-' + deploy.server), tServer);

    } else {
        data = await CommonService.createObject("tservers", tServer);
    }

    return {
        ret: 200,
        msg: 'succ',
        data: data.body
    };
}

//从cloud上升级服务(不更新配置等信息, 仅仅修改镜像地址)
DeployService.upgrade = async (deploy, source) => {

    let tServer = await CommonService.getServer(deploy.app + '.' + deploy.server);

    if (!tServer) {
        return {
            ret: 500,
            msg: 'server not exists'
        };
    }

    //创建timages
    deploy.repo.id = "v-" + (new Date()).getTime();

    let tImage = await ImageService.serverImageCreateWithRelease(deploy, "cloud");
    if (tImage.ret != 200) {
        logger.error("createServerWithImage serverImageGetAndCreate error:", rst);
        return rst;
    }

    tServer = tServer.body;

    if (source[CommonService.TServerCloudProduct]) {
        tServer.metadata.labels[CommonService.TServerCloudInstall] = "product";
    } else {
        tServer.metadata.labels[CommonService.TServerCloudInstall] = "service";
    }
    tServer.metadata.annotations = tServer.metadata.annotations || {};
    tServer.metadata.annotations[CommonService.TServerCloudInstall] = tServer.metadata.annotations[CommonService.TServerCloudInstall] || "{}";

    let oldSource = JSON.parse(tServer.metadata.annotations[CommonService.TServerCloudInstall]);

    //保留历史的CloudId和CloudTitle
    source[CommonService.TServerCloudID] = oldSource[CommonService.TServerCloudID];
    if (source[CommonService.TServerCloudProduct] && oldSource[CommonService.TServerCloudProduct]) {
        source[CommonService.TServerCloudProduct][CommonService.TServerCloudTitle] = oldSource[CommonService.TServerCloudProduct][CommonService.TServerCloudTitle] || "";
        source[CommonService.TServerCloudProduct][CommonService.TServerCloudID] = oldSource[CommonService.TServerCloudProduct][CommonService.TServerCloudID] || "";
    }

    tServer.metadata.annotations[CommonService.TServerCloudInstall] = JSON.stringify(source);

    tServer.spec.release = {};
    tServer.spec.release.id = deploy.repo.id;
    tServer.spec.release.image = deploy.repo.image;
    tServer.spec.release.secret = deploy.repo.secret;

    let data = await CommonService.replaceObject("tservers", tServer.metadata.name, tServer);

    return {
        ret: 200,
        msg: 'succ',
        data: data.body
    };
}


module.exports = DeployService;