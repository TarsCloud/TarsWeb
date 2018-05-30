const NotifyDao = require('../../dao/NotifyDao');
const logger = require('../../logger');
const serverService = require('../server/ServerService');
const _ = require('lodash');

const NotifyService = {}

NotifyService.getServerNotifyList = async(params, curPage, pageSize)=> {
    var serverConfs = await serverService.getServerConfList4Tree(params, 0, 0);
    var serverIds = [];
    serverConfs.forEach((v) => {
        serverIds.push(v.application + '.' + v.server_name + '_' + v.node_name);
    });
    return await NotifyDao.getServerNotifyList(serverIds, curPage, pageSize)
}

module.exports = NotifyService;