const NotifyDao = require('../../dao/NotifyDao');
const logger = require('../../logger');
const serverService = require('../server/ServerService');
const _ = require('lodash');

const NotifyService = {}

NotifyService.getServerNotifyList = async(treeNode, curPage, pageSize)=> {
    var serverConfs = await serverService.getServerConfList4Tree(treeNode, 0, 0);
    var serverIds = [];
    serverConfs.forEach(function (v) {
        serverIds.push(v.application + '.' + v.server_name + '_' + v.node_name);
    });
    return await NotifyDao.getServerNotifyList(serverIds, curPage, pageSize)
}

module.exports = NotifyService;