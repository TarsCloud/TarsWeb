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

const TreeService = {};
const treeIgnore = ["tars-tarsweb"];


TreeService.tree = async (searchKey, force) => {

    let serverList = await CommonService.getServerList(force);

    //<app, serverName[]>
    let allApp = new Map();

    serverList.forEach((item) => {

        const serverApp = item.spec.app;
        const serverName = item.spec.server;
        const serverType = item.spec.subType;

        if (searchKey && serverApp.indexOf(searchKey) == -1 && serverName.indexOf(searchKey) == -1) {
            return
        }
        if (treeIgnore.indexOf(item.metadata.name) != -1) {
            return;
        }
        const server = {
            ServerId: `${serverApp}.${serverName}`,
            ServerName: serverName,
            serverType: serverType
        }

        if (!allApp.has(serverApp)) {
            allApp.set(serverApp, []);
        }

        allApp.get(serverApp).push(server);
    });

    // console.log(serverList);

    let emptyBusiness = {
        BusinessName: "",
        BusinessShow: "",
        App: [],
    }

    const treeData = await CommonService.getTreeData();

    let bussinessMap = new Map();

    treeData.businesses.forEach((item) => {
        bussinessMap.set(item.name, {
            BusinessName: item.name,
            BusinessShow: item.show,
            App: [],
        });
    });

    bussinessMap.set("", emptyBusiness);

    let result = [];

    treeData.apps.forEach((app) => {
        const appName = app.name;
        const businessName = app.businessRef;

        let businessShow;
        if (bussinessMap.has(businessName)) {
            businessShow = bussinessMap.get(businessName).BusinessShow;
        }

        do {
            if (businessName == "") {

                if (allApp.has(appName)) {
                    emptyBusiness.App.push({
                        ServerApp: appName,
                        Server: allApp.get(appName),
                    });
                } else {
                    emptyBusiness.App.push({
                        ServerApp: appName,
                        Server: [],
                    });
                }

                break
            }

            if (bussinessMap.has(businessName)) {
                bussinessMap.get(businessName).App.push({
                    ServerApp: appName,
                    Server: allApp.get(appName) || [],
                })

            }

            break
        } while (true);
    });

    bussinessMap.forEach((value, key) => {
        result.push(value);
    });

    //filter server list is empty
    result = result.filter(item => {
        item.App = item.App.filter(a => {
            return a.Server.length > 0;
        });

        return item.App.length > 0;
    });

    for (let i = 0; i < result.length; i++) {

        for (let j = 0; j < result[i].App.length; j++) {

            result[i].App[j].Server.sort((e1, e2) => {
                if (e1.ServerName < e2.ServerName)
                    return -1;
                else if (e1.ServerName == e2.ServerName)
                    return 0;
                return 1;
            });
        }

        result[i].App.sort((e1, e2) => {
            if (e1.ServerApp < e2.ServerApp)
                return -1;
            else if (e1.ServerApp == e2.ServerApp)
                return 0;
            return 1;
        });

    }

    return {
        ret: 200,
        msg: 'succ',
        data: result
    };
}

module.exports = TreeService;