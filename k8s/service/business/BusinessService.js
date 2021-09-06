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

const BusinessService = {};

BusinessService.businessCreate = async (metadata) => {
   
    let tTree = await CommonService.getTreeData();

    let bussiness = tTree.businesses.find(item => {
        return item.name == metadata.BusinessName;
    })

    if (bussiness) {
        return { ret: 500, msg: 'duplicate bussiness' };
    }
    
    let tTreeCopy = JSON.parse(JSON.stringify(tTree));

    tTreeCopy.businesses.push({
        name: metadata.BusinessName,
        show: metadata.BusinessShow,
        mark: metadata.BusinessMark,
        weight: metadata.BusinessOrder,
        createPerson: "admin",
        CreateTime: new Date(),
    });

    let data = await CommonService.replaceObject("ttrees", CommonService.TREENAME, tTreeCopy);

    return { ret: 200, msg: 'succ', data: data.body };
}

BusinessService.businessSelect = async (isAll, BusinessName, BusinessShow, BusinessMark, limiter) => {

    let tTree = await CommonService.getTreeData();

    let allItems = tTree.businesses;

	// filter
    let filterItems = allItems;

	if (!isAll) {
        filterItems = [];

        allItems.forEach(elem => {
            
            if (BusinessName.length > 0 && elem.name.indexOf(BusinessName) == -1)
                return;

            if (BusinessShow.length > 0 && elem.show.indexOf(BusinessShow) != -1)
                return;

            if (BusinessMark.length > 0 && elem.mark && elem.mark.indexOf(BusinessMark) != -1)
                return;

            filterItems.push(elem);
        });
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
        elem["BusinessName"] = item.name
        elem["BusinessShow"] = item.show
        elem["BusinessMark"] = item.mark
        elem["BusinessOrder"] = item.weight
        elem["CreateTime"] = item.createTime
        elem["CreatePerson"] = item.createPerson

        result.Data.push(elem);
    });

    return { ret: 200, msg: 'succ', data: result };
}

BusinessService.businessUpdate = async (metadata, target) => {

    let tTree = await CommonService.getTreeData();

    let index = -1;
    for (let i = 0; i < tTree.businesses.length; i++) {
        if (tTree.businesses[i].name == metadata.BusinessName) {

            index = i;
            break;
        }
    }

    if (index == -1) {
        return { ret: 500, msg: 'businesses not exists' };
    }

    let tTreeCopy = JSON.parse(JSON.stringify(tTree));

	tTreeCopy.businesses[index].show = target.BusinessShow
	tTreeCopy.businesses[index].mark = target.BusinessMark
	tTreeCopy.businesses[index].weight = target.BusinessOrder

    let data = await CommonService.replaceObject("ttrees", CommonService.TREENAME, tTreeCopy);

    return { ret: 200, msg: 'succ', data: data.body };

}

BusinessService.businessDelete = async (metadata) => {

    let tTree = await CommonService.getTreeData();

    let index = -1;
    for (let i = 0; i < tTree.businesses.length; i++) {
        if (tTree.businesses[i].name == metadata.BusinessName) {

            index = i;
            break;
        }
    }

    if (index == -1) {
        return { ret: 500, msg: 'businesses not exists' };
    }

    let tTreeCopy = JSON.parse(JSON.stringify(tTree));

    tTreeCopy.businesses.splice(index, 1);

    let data = await CommonService.replaceObject("ttrees", CommonService.TREENAME, tTreeCopy);

    return { ret: 200, msg: 'succ', data: data.body };
}

BusinessService.businessAddApp = async (metadata) => {

    let tTree = await CommonService.getTreeData();

    let tTreeCopy = JSON.parse(JSON.stringify(tTree));

    for (let i = 0; i < tTreeCopy.apps.length; i++) {

        if (metadata.AppNames.indexOf(tTreeCopy.apps[i].name) > -1) {
            
            tTreeCopy.apps[i].businessRef = metadata.BusinessName 
        }
    }

    let data = await CommonService.replaceObject("ttrees", CommonService.TREENAME, tTreeCopy);

    return { ret: 200, msg: 'succ', data: data.body }
}

BusinessService.businessListByApp = async (BusinessNames) => {

    let tTree = await CommonService.getTreeData();

    let buzMap = {};
   
    tTree.businesses.forEach(buz => {
        buzMap[buz.name] = {
            BusinessName: buz.name,
            BusinessShow: buz.show,
            App: []
        }
    })


    tTree.apps.forEach(app => {
        if (buzMap[app.businessRef]) {
            buzMap[app.businessRef].App.push(app.name);
        }
    })

    let result = [];

    BusinessNames.forEach(item => {
        if (buzMap[item]) {
            result.push(buzMap[item])
        }
    })

    return { ret: 200, msg: 'succ', data: result };
}

module.exports = BusinessService;