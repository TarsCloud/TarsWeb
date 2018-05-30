const logger = require('../../logger');
const ServerController = require('../../controller/server/ServerController');
const NotifyService = require('../../service/notify/NotifyService');
const AuthService = require('../../service/auth/AuthService');

const NotifyController = {};
const util = require('../../tools/util');

const serverNotifyStruct = {
    notifytime: {formatter: util.formatTimeStamp},
    server_id: '',
    thread_id: '',
    command: '',
    result: ''
};

NotifyController.getServerNotifyList = async(ctx) => {
    let treeNodeId = ctx.paramsObj.tree_node_id;
    let curPage = parseInt(ctx.paramsObj.cur_page) || 0;
    let pageSize = parseInt(ctx.paramsObj.page_size) || 0;
    try {
        let params = ServerController.formatTreeNodeId(treeNodeId);
        if (!await AuthService.hasDevAuth(params.application, params.serverName, ctx.uid)) {
            ctx.makeNotAuthResObj();
        } else {
            let rst = await NotifyService.getServerNotifyList(params, curPage, pageSize);
            ctx.makeResObj(200, '', util.viewFilter(rst, serverNotifyStruct));
        }

    } catch (e) {
        logger.error('[getServerNotifyList]', e);
        ctx.makeErrResObj();
    }
};


module.exports = NotifyController;