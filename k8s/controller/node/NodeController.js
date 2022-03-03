const logger = require('../../../logger')
const NodeService = require('../../service/node/NodeService');

const NodeController = {};

/**
 * 节点列表
 * @param  {String}  Token                登录签名
 * @param  {String}  NodeName             名称
 * @param  {String}  NodeMark             备注
 * @param  {String}  CreateTime           创建时间
 * @param  {String}  CreatePerson         创建人
 */
NodeController.NodeSelect = async (ctx) => {
    let {
        Token = '', page = 1, isAll = false, NodeName = '', ServerApp = '', ServerName = '', localPV = false, hold = false
    } = ctx.paramsObj
    isAll = isAll == "true";
    localPV = localPV == "true";
    hold = hold == "true";
    let pageIndex = Math.floor(page) || 1
    let pageSize = 10

    let limiter = null;
    if (!isAll) {
        limiter = {
            offset: (pageIndex - 1) * pageSize,
            rows: pageSize,
        }
    }
    try {
        let result = await NodeService.nodeSelect(isAll, NodeName, ServerApp, ServerName, localPV, hold, limiter);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[NodeSelect]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

/**
 * 节点列表
 * @param  {String}  Token                登录签名
 */
NodeController.NodeList = async (ctx) => {
    let {
        Token = '',

    } = ctx.paramsObj

    try {
        let result = await NodeService.nodeList();
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[NodeList]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

/**
 * 启用节点为taf框架节点
 * @param  {String}  Token                登录签名
 * @param  {Array}   NodeName             名称
 */
NodeController.openAbility = async (ctx) => {
    let {
        Token = '', NodeName = ''
    } = ctx.paramsObj
    try {
        const metadata = {
            NodeName
        }
        let result = await NodeService.openAbility(metadata);
        ctx.makeResObj(result.ret, result.msg, result.data);
    } catch (e) {
        logger.error('[openAbility]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

/**
 * 关闭节点为taf框架节点
 * @param  {String}  Token                登录签名
 * @param  {Array}   NodeName             名称
 */
NodeController.closeAbility = async (ctx) => {
    let {
        Token = '', NodeName = ''
    } = ctx.paramsObj
    try {
        const metadata = {
            NodeName
        }
        let result = await NodeService.closeAbility(metadata);
        ctx.makeResObj(result.ret, result.msg, result.data);
    } catch (e) {
        logger.error('[closeAbility]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}


NodeController.editCommonTag = async (ctx) => {
    let {
        Token = '', nodeName = "", tags = []
    } = ctx.paramsObj
    try {
        const metadata = {
            nodeName,
            tags
        }
        let result = await NodeService.editCommonTag(metadata);
        ctx.makeResObj(result.ret, result.msg, result.data);
    } catch (e) {
        logger.error('[editCommonTag]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}
NodeController.batchEditCommonTag = async (ctx) => {
    let {
        Token = '', nodeNames = [], tags = []
    } = ctx.paramsObj
    try {
        const metadata = {
            nodeNames,
            tags
        }
        let result = await NodeService.batchEditCommonTag(metadata);
        ctx.makeResObj(result.ret, result.msg, result.data);
    } catch (e) {
        logger.error('[batchEditCommonTag]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

NodeController.editAbilityTag = async (ctx) => {
    let {
        Token = '', nodeName = "", tags = []
    } = ctx.paramsObj
    try {
        const metadata = {
            nodeName,
            tags
        }
        let result = await NodeService.editAbilityTag(metadata);
        ctx.makeResObj(result.ret, result.msg, result.data);
    } catch (e) {
        logger.error('[NodeStopPublic]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

NodeController.batchEditAbilityTag = async (ctx) => {
    let {
        Token = '', nodeNames = [], tags = []
    } = ctx.paramsObj
    try {
        const metadata = {
            nodeNames,
            tags
        }
        console.log("metadata:" + JSON.stringify(metadata, null, 4));
        let result = await NodeService.batchEditAbilityTag(metadata);
        ctx.makeResObj(result.ret, result.msg, result.data);
    } catch (e) {
        logger.error('[batchEditAbilityTag]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

module.exports = NodeController;