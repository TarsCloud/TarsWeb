const logger = require('../../logger');
const NotifyService = require('../../service/notify/NotifyService');
const NotifyController = {};
const util = require('../util/util');

const serverNotifyStruct = {
    notifytime: util.formatTimeStamp,
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
        let rst = await NotifyService.getServerNotifyList(treeNodeId, curPage, pageSize);
        ctx.makeResObj(200, '', util.viewFilter(rst, serverNotifyStruct));
    } catch (e) {
        logger.error('[getServerNotifyList]', e);
        ctx.makeErrResObj();
    }
};


module.exports = NotifyController