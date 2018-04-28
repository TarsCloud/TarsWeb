const logger = require('../../logger');
const NotifyService = require('../../service/notify/NotifyService');
const NotifyController = {};

NotifyController.getServerNotifyList = async(ctx) => {
    let treeNodeId = ctx.paramsObj.tree_node_id;
    let curPage = parseInt(ctx.paramsObj.cur_page) || 0;
    let pageSize = parseInt(ctx.paramsObj.page_size) || 0;
    try {
        let notifyList = await NotifyService.getServerNotifyList(treeNodeId, curPage, pageSize);
        let rst = [];
        notifyList.forEach(function (v) {
            rst.push({
                notifytime: v.notifytime,
                server_id: v.server_id,
                thread_id: v.thread_id,
                command: v.command,
                result: v.result
            })
        });
        ctx.makeResObj(200, '', rst);
    } catch (e) {
        logger.error('[getServerNotifyList]', e);
        ctx.makeErrResObj();
    }
};


module.exports = NotifyController