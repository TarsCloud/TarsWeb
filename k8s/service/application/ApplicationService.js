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

const CommonService = require('../common/CommonService');

const ApplicationService = {};


ApplicationService.applicationCreate = async (metadata) => {

    if (await CommonService.hasAppName(metadata.ServerApp)) {
        return { ret: 500, msg: `Duplicated App: ${metadata.ServerApp} Already Existed`, data: { Result: 0 } };
    }

    let tTree = await CommonService.getTreeData();

    let tTreeCopy = JSON.parse(JSON.stringify(tTree));

    tTreeCopy.apps.push({
        name: metadata.ServerApp,
        businessRef: metadata.BusinessName,
        createPerson: "Admin",
        createTime: new Date(),
        mark: metadata.AppMark

    });

    let data = await CommonService.replaceObject("ttrees", CommonService.TREENAME, tTreeCopy);

    return { ret: 200, msg: 'succ', data: data.body};

}

ApplicationService.applicationSelect = async (isAll, ServerApp, BusinessName, limiter) => {
   
    let tTree = await CommonService.getTreeData();

    let allItems = tTree.apps;

    // filter
    let filterItems = allItems;

    if (!isAll) {
        
        filterItems = [];

        allItems.forEach(elem => {

            if ((ServerApp.length > 0 && elem.name.indexOf(ServerApp) == -1))
                return;

            if ((BusinessName.length > 0 && elem.businessRef.indexOf(BusinessName) == -1))
                return;

            filterItems.push(elem);
        })
    }

    allItems = filterItems;

    // limiter
    if (limiter != null) {
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
        let elem = {};
		elem["ServerApp"] = item.name
		elem["AppMark"] = item.mark
		elem["BusinessName"] = item.businessRef
		elem["CreateTime"] = item.createTime
		elem["CreatePerson"] = item.createPerson
        result.Data.push(elem);
    })

    return { ret: 200, msg: 'succ', data: result};
}

ApplicationService.applicationUpdate = async (metadata, target) => {

    let tTree = await CommonService.getTreeData();

    let index = -1;
    for (let i = 0; i < tTree.apps.length; i++) {
        if (tTree.apps[i].name == metadata.ServerApp) {

            index = i;
            break;
        }
    }

    if (index == -1) {
        return { ret: 500, msg: 'app not exists' };
    }

    let tTreeCopy = JSON.parse(JSON.stringify(tTree));
    
    tTreeCopy.apps[index].businessRef = target.BusinessName
    tTreeCopy.apps[index].mark = target.AppMark

    let data = await CommonService.replaceObject("ttrees", CommonService.TREENAME, tTreeCopy);

    return { ret: 200, msg: 'succ', data: data.body};
}

ApplicationService.applicationDelete = async (metadata) => {

    let tTree = await CommonService.getTreeData();

    let index = -1;
    for (let i = 0; i < tTree.apps.length; i++) {
        if (tTree.apps[i].name == metadata.ServerApp) {

            index = i;
            break;
        }
    }

    if (index == -1) {
        return { ret: 500, msg: 'app not exists' };
    }

    let labelSelector = `${CommonService.TSubTypeLabel}=${CommonService.TServerType1},${CommonService.TServerAppLabel}=${metadata.ServerApp}`;

    let serverList = await CommonService.listObject("tservers", labelSelector);
 
    if (serverList.body.items.length > 0) {
        return { ret: 500, msg: `Must Clear All TServer in ${metadata.ServerApp}` };
    }

    let tTreeCopy = JSON.parse(JSON.stringify(tTree));
    tTreeCopy.apps.splice(index, 1);

    let data = await CommonService.replaceObject("ttrees", CommonService.TREENAME, tTreeCopy);

    return { ret: 200, msg: 'succ', data: data.body };

}

module.exports = ApplicationService;