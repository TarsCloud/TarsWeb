/** *
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
 
const ServerDao = require('../../dao/ServerDao');
const logger = require('../../logger/index');
const util = require('../../tools/util');
const AuthService = require('../auth/AuthService');

const TreeService = {};

TreeService.getTreeNodes = async(uid) => {
    let serverList;
    if(await AuthService.hasAdminAuth(uid)){
        serverList = await ServerDao.getServerConf4Tree();
    }else{
        let appCond = [];
        let serverCond = [];
        let authList = await AuthService.getAuthListByUid(uid);
        authList.forEach((auth)=>{
            let application = auth.application;
            let serverName = auth.serverName;
            if(serverName){
                serverCond.push(application + '.' + serverName);
            }else{
                appCond.push(application);
            }
        });
        serverList = await ServerDao.getServerConf4Tree(appCond, serverCond);
    }

    let treeNodeList = [];
    let treeNodeMap = {};
    let rootNode = [];
    serverList.forEach(function (server) {
        server = server.dataValues;
        let id;
        if (server.enable_set == 'Y') {
            id = '1' + server.application + '.' + '2' + server.set_name + '.' + '3' + server.set_area + '.' + '4' + server.set_group + '.' + '5' + server.server_name;
        } else {
            id = '1' + server.application + '.' + '5' + server.server_name;
        }
        let treeNode = {};
        treeNode.id = id;
        treeNode.name = server.server_name;
        treeNode.pid = id.substring(0, id.lastIndexOf('.'));
        treeNode.is_parent = false;
        treeNode.open = false;
        treeNode.children = [];
        treeNodeList.push(treeNode);
        treeNodeMap[id] = treeNode;
        TreeService.parents(treeNodeMap, treeNode, rootNode);
    });
    return rootNode;
};

/** *
 * 将应用服务转换成层级数据
 * @param treeList
 */
TreeService.parents = (treeNodeMap, treeNode, rootNodes)=> {
    let id = treeNode.pid;

    if (id == 'root') {
        rootNodes.push(treeNode);
        return;
    }

    if (treeNodeMap[id]) {
        treeNodeMap[id].children.push(treeNode);
        return;
    }

    let pid, name;
    let idx = id.lastIndexOf('.');
    if (idx === -1) {
        pid = 'root';
        name = id;
    } else {
        pid = id.substring(0, idx);
        name = id.substring(idx + 1);
    }
    let newTreeNode = {};
    newTreeNode.id = id;
    newTreeNode.name = name.substring(1);
    newTreeNode.pid = pid;
    newTreeNode.is_parent = true;
    newTreeNode.open = true;
    newTreeNode.children = [];
    newTreeNode.children.push(treeNode);

    treeNodeMap[id] = newTreeNode;
    TreeService.parents(treeNodeMap, newTreeNode, rootNodes);

};

module.exports = TreeService;