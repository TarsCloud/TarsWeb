const logger = require('../../../logger')
const CommonService = require('../../service/common/CommonService');
const PodService = require('../../service/pod/PodService');
const ServerController = require("../../controller/server/ServerController");
const PodController = {};

PodController.PodSearch = async (ctx) => {
    let {
        searchkey,
        c
    } = ctx.paramsObj

    try {
        let rst = await PodService.searchPod(searchkey.trim(), c);

        ctx.makeResObj(200, '', {
            continue: rst.data.continue,
            rows: rst.data.Data
        })
    } catch (e) {
        logger.error('[getServerSearch]', e, ctx);
        ctx.makeErrResObj();
    }
}


/**
 * Pod存活列表
 */
PodController.PodAliveSelect = async (ctx) => {

    let {
        Token = '', tree_node_id = ''
    } = ctx.paramsObj

    let filter = {
        eq: {},
    }

    let serverData = ServerController.formatTreeNodeId(tree_node_id);

    filter.eq[CommonService.TServerAppLabel] = serverData.application;
    if (serverData.serverName) {
        filter.eq[CommonService.TServerNameLabel] = serverData.serverName;
    }

    // console.log(filter);

    try {

        let result = await PodService.podAliveSelect(filter);

        // console.log(result);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[PodAliveSelect]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

/**
 * Pod历史列表
 */
PodController.PodPerishedSelect = async (ctx) => {
    const that = module.exports

    let {
        Token = '', tree_node_id = ''
    } = ctx.paramsObj

    try {
        let serverData = ServerController.formatTreeNodeId(tree_node_id);

        let result = await PodService.podPerishedSelect(serverData);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        // console.log(e);
        logger.error('[PodPerishedSelect]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

//删除pod
PodController.deletePod = async (ctx) => {
    let {
        Token = '', PodName = ''
    } = ctx.paramsObj
    try {
        let result = await PodService.deletePod(PodName);
        ctx.makeResObj(result.ret, result.msg, result.data);
    } catch (e) {
        logger.error('[deletePod]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}
module.exports = PodController;