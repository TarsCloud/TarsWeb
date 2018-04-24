const logger = require('../../logger');
const ServerService = require('../../service/server/ServerService');

const ServerController = {};

ServerController.getServerConfById = async(ctx) => {
    var id = ctx.paramsObj.id;
    try {
        var rst = await ServerService.getServerConfById(id);
        ctx.makeResObj(200, '', rst);
    } catch (e) {
        logger.error('[getServerConfById]', e);
        ctx.makeErrResObj();
    }
};

ServerController.serverExist = async(ctx) => {
    var id = ctx.paramsObj.id;
    try {
        await ServerService.getServerConfById(id);
        ctx.makeResObj(200, '', rst);
    } catch (e) {
        logger.error('[getServerConfById]', e);
        ctx.makeErrResObj();
    }
};

ServerController.getServerConfList4Tree = async(ctx) => {
    var treeNodeId = ctx.paramsObj.tree_node_id;
    var curPage = parseInt(ctx.paramsObj.cur_page) || 0;
    var pageSize = parseInt(ctx.paramsObj.page_size) || 0;
    try {
        var rst = await ServerService.getServerConfList4Tree(treeNodeId, curPage, pageSize);
        ctx.makeResObj(200, '', rst);
    } catch (e) {
        logger.error('[getServerConfList4Tree]', e);
        ctx.makeErrResObj();
    }
};

ServerController.getInactiveServerConfList = async(ctx) => {
    var application = ctx.paramsObj.application || '';
    var serverName = ctx.paramsObj.server_name || '';
    var nodeName = ctx.paramsObj.node_name || '';
    var curPage = parseInt(ctx.paramsObj.cur_page) || 0;
    var pageSize = parseInt(ctx.paramsObj.page_size) || 0;
    try {
        var rst = await ServerService.getInactiveServerConfList(application, serverName, nodeName, curPage, pageSize);
        ctx.makeResObj(200, '', rst);
    } catch (e) {
        logger.error('[getServerConfList4Tree]', e);
        ctx.makeErrResObj();
    }
};

ServerController.getRealtimeState = async(ctx)=> {
    var id = ctx.paramsObj.id;
    try {
        var rst = await ServerService.getServerConfById(id);
        if(rst.length){
            ctx.makeResObj(200, '', {realtime_state: rst[0].getDataValue('present_state')});
        }else{
            logger.warn('[getRealtimeState]', '未查询id相应的服务');
            ctx.makeErrResObj();
        }
    } catch (e) {
        logger.error('[getServerConfById]', e);
        ctx.makeErrResObj();
    }
}


module.exports = ServerController