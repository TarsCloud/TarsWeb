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

const ServerService = {};

ServerService.searchServer = async (searchKey) => {

    let allItems = await CommonService.getServerList();

    let items = [];

    allItems.forEach((item) => {

        if (searchKey.length > 0 && item.spec.server.indexOf(searchKey) == -1)
            return;

        items.push(item);
    })

    allItems = items;

	// Count填充
    let result = {};
    // result.Count = {};
    // result.Count["AllCount"] = allItems.length;
    // result.Count["FilterCount"] = filterItems.length;

	// Data填充
    result.Data = [];

    allItems.forEach(item => {

        let elem = {
		    ServerId: item.spec.app + '.' + item.spec.server,
		    ServerApp: item.spec.app,
            ServerName: item.spec.server,
        };

		// if(item.spec.Release != null) {
        //     elem["ServerType"] = item.spec.release.serverType;
        // }

        result.Data.push(elem);
    })

    return { ret: 200, msg: 'succ', data: result };
}

ServerService.selectServer = async (ServerApp, ServerName, limiter) => {

    let allItems = await CommonService.getServerList();

    let items = [];

    allItems.forEach((item) => {

        if (ServerApp.length > 0 && item.spec.app.indexOf(ServerApp) == -1)
            return;

        if (ServerName.length > 0 && item.spec.server.indexOf(ServerName) == -1)
            return;

        items.push(item);
    })

    allItems = items;

	// filter
    let filterItems = allItems;

	// limiter
	if(limiter != null) {
        let { start, stop } = CommonService.pageList(filterItems.length, limiter);

        filterItems = filterItems.slice(start, stop);
	}

	// Count填充
    let result = {};
    result.Count = {};
    result.Count["AllCount"] = allItems.length;
    result.Count["FilterCount"] = filterItems.length;

	// Data填充
    result.Data = [];

    filterItems.forEach(item => {
        // console.log(item);

        let elem = {
		    ServerId: item.spec.app + '.' + item.spec.server,
		    ServerApp: item.spec.app,
            ServerName: item.spec.server,
        };

		if(item.spec.Release != null) {
            elem["ServerType"] = item.spec.release.serverType;
        }

        result.Data.push(elem);
    })

    // console.log(result);
    return { ret: 200, msg: 'succ', data: result };
    // return result;
}

ServerService.updateServer = async (metadata, target) => {

    let server = await CommonService.getServer(metadata.ServerId);
    if (!server) {
        return { ret: 500, msg: 'no server' };
    }

    let serverCopy = JSON.parse(JSON.stringify(server));

	if(serverCopy.spec.release == null) {
        serverCopy.spec.release = {};
	}

	if(serverCopy.spec.release.serverType == target.ServerType) {
		// 服务发布时会调用，默认一定是传相同的
        return { ret: 200, msg: 'succ', data: { Result: 0 } };
	}

    serverCopy.spec.release.serverType = target.serverType;

    let data = await k8sApi.replacObject("tservers", serverCopy.metadata.name, serverCopy);

    return { ret: 200, msg: 'succ', data: data.body };
}


ServerService.deleteServer = async (metadata) => {

    metadata.ServerId.forEach(async(item)=> {

        try {
            await CommonService.deleteObject("tservers", CommonService.getTServerName(item));
        } catch (e) {
            logger.error(e);
        }

        try {
            await CommonService.deleteObject("treleases", CommonService.getTServerName(item));
        } catch (e) {
            logger.error(e);
        }
    });

    return { ret: 200, msg: 'succ'};
}


ServerService.serverOptionSelect = async (ServerId, limiter) => {

    let v = ServerId.split(".");

    let labelSelector = `${CommonService.TServerAppLabel}=${v[0]},${CommonService.TServerNameLabel}=${v[1]}`;

    let filterItems = (await CommonService.listObject("tservers", labelSelector)).body.items;

    // console.log(filterItems);

	// limiter
	if (limiter != null) {
        let { start, stop } = CommonService.pageList(filterItems.length, limiter);
        filterItems = filterItems.splice(start, stop);
	}

	// Count填充
    let result = {}; //&models.SelectResult{}
    result.Count = {}; //make(models.MapInt)
    result.Count["AllCount"] = filterItems.length;
    result.Count["FilterCount"] = filterItems.length;

    // Data填充
    result.Data = []; //make(models.ArrayMapInterface, 0, len(filterItems))
    // normal 服务无spec.tars域
    filterItems.forEach(item => {
        let elem = {}; //make(map[string]interface{})
        let tars = item.spec.tars;
        elem["ServerId"] = CommonService.getServerId(item.spec.app, item.spec.server);
        elem["ServerApp"] = item.spec.app
        elem["ServerName"] = item.spec.server
        elem["ServerImportant"] = item.spec.important
        elem["ServerTemplate"] = tars ? tars.template || "" : ""
        elem["ServerProfile"] = tars ? tars.profile || "" : ""
        elem["AsyncThread"] = tars ? tars.asyncThread || "" : ""
        elem["serverType"] = item.spec.subType
        result.Data.push(elem);
    });

    return { ret: 200, msg: 'succ', data: result };

}

ServerService.serverOptionUpdate = async (metadata, target) => {

    let tServer = await CommonService.getServer(CommonService.getTServerName(metadata.ServerId));
    if (!tServer) {
        return { ret: 500, msg: "server not exists" };
    }
    tServer = tServer.body;


    let tServerCopy = JSON.parse(JSON.stringify(tServer));

    // console.log(tServerCopy.spec.tars, target);

	tServerCopy.spec.important = target.ServerImportant
	tServerCopy.spec.tars.template = target.ServerTemplate
	tServerCopy.spec.tars.profile = target.ServerProfile
	tServerCopy.spec.tars.asyncThread = target.AsyncThread

    let data = await CommonService.replaceObject("tservers", tServerCopy.metadata.name, tServerCopy);

    return { ret: 200, msg: 'succ', data: data.body };
}

ServerService.serverOptionTemplate = async (metadata) => {

    let tServer = await CommonService.getServer(CommonService.getTServerName(metadata.ServerId));
    if (!tServer) {
        return { ret: 500, msg: "server not exists" };
    }

    tServer = tServer.body;

    let profile = tServer.spec.tars.profile;
    let templateName = tServer.spec.tars.template

    let allTemplateContent = []; //make([][]byte, 0, 10)
    allTemplateContent.push(profile);

    do {

        let curTemplate = await CommonService.getObject("ttemplates",templateName);
        if (!curTemplate) {
            return { ret: 500, msg: "template not exists" };
        }

        curTemplate = curTemplate.body;

        let templateContent = curTemplate.spec.content

        let parentTemplateName = curTemplate.spec.parent

        let parTemplate = await CommonService.getObject("ttemplates",parentTemplateName);
        if (!parTemplate) {
            return { ret: 500, msg: "parent template not exists" };
        }
        parTemplate = parTemplate.body;

        let parentContent = parTemplate.spec.content

        if(allTemplateContent.length == 1) {
            allTemplateContent.push(templateContent);
        }

        if(parentTemplateName == templateName) {
            break
        }

        allTemplateContent.push(parentContent);

        templateName = parentTemplateName
    } while (true);

    let afterJoinTemplateContent = "";

    allTemplateContent.forEach(item => {
        afterJoinTemplateContent += "\r\n";
        afterJoinTemplateContent += item;
    });

    return { ret: 200, msg: 'succ', data: afterJoinTemplateContent };
}
module.exports = ServerService;
