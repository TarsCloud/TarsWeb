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
NodeController.NodeSelect = async(ctx) => {
    let { Token = '', page = 1, isAll = false,
        NodeName = '', NodeMark = '',
    } = ctx.paramsObj

    isAll = isAll == "true";

    let pageIndex = Math.floor(page) || 1
    let pageSize = 10

    let limiter = null;
    if(!isAll){
        limiter = {
            offset: (pageIndex - 1) * pageSize,
            rows: pageSize,
        }
    }

    try {
        let result = await NodeService.nodeSelect(isAll, NodeName, NodeMark, limiter);
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
NodeController.NodeList = async(ctx) => {
    let { Token = '',

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
 * 启用公用节点
 * @param  {String}  Token                登录签名
 * @param  {Array}   NodeName             名称
 */
NodeController.NodeStartPublic = async(ctx) => {
    let { Token = '',
        NodeName = ''
    } = ctx.paramsObj
    
    try {
        const metadata = {
            NodeName
        }

        let result = await NodeService.nodeStartPublic(metadata);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[NodeStartPublic]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

/**
 * 停用公用节点
 * @param  {String}  Token                登录签名
 * @param  {Array}   NodeName             名称
 */
NodeController.NodeStopPublic = async(ctx) => {
    let { Token = '',
        NodeName = '' 
    } = ctx.paramsObj
    
    try {
        const metadata = {
            NodeName
        }
        let result = await NodeService.nodeStopPublic(metadata);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[NodeStopPublic]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

module.exports = NodeController;