const ServerDao = require('../../dao/ServerDao');
const logger = require('../../logger/index');
const util = require('../../tools/util');

const TreeService = {};

TreeService.getTreeNodes = async(authList) => {
    let appCond = [];
    let serverCond = [];
    let isAdmin = false;
    authList.forEach((auth)=>{
        if(auth.role === 'admin'){
            isAdmin = true;
        }
        let appServer = auth.flag;
        if(appServer.indexOf('.') > -1){
            serverCond.push(appServer);
        }else{
            appCond.push(appServer);
        }
    });
    let serverList;
    if(isAdmin){
        serverList = await ServerDao.getServerConf4Tree();
    }else{
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

/**
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
    newTreeNode.name = name;
    newTreeNode.pid = pid;
    newTreeNode.parent = true;
    newTreeNode.open = true;
    newTreeNode.children = [];
    newTreeNode.children.push(treeNode);

    treeNodeMap[id] = newTreeNode;
    TreeService.parents(treeNodeMap, newTreeNode, rootNodes);

};

module.exports = TreeService;