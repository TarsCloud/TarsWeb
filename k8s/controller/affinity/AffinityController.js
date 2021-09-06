const logger = require('../../../logger')
const AffinityService = require('../../service/affinity/AffinityService');

const AffinityController = {};

/**
 * 亲和性聚合Node
 * @param  {String}  Token                登录签名
 */
AffinityController.AffinityListByNode = async(ctx) => {
    let { Token = '',
        NodeName = []
    } = ctx.paramsObj

    try {
        let result = await AffinityService.affinityListByNode(NodeName);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[AffinityListByNode]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

/**
 * 亲和性聚合Server
 * @param  {String}  Token                登录签名
 */
AffinityController.AffinityListByServer = async(ctx) =>{
    let { Token = '',
        ServerApp,
        ServerName = "",
        NodeName,
    } = ctx.paramsObj

    try {
        let result = await AffinityService.affinityListByServer(NodeName, ServerApp, ServerName);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[AffinityListByServer]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
},
/**
 * 亲和性批量增加server
 * @param  {String}  Token                登录签名
 * @param  {String}  NodeName             节点名
 * @param  {Array}   ServerApp            应用
 */
AffinityController.AffinityAddServer = async(ctx) => {
    let { Token = '', NodeName = '', ServerApp = [] } = ctx.paramsObj

    try {
        let result = await AffinityService.affinityAddServer(NodeName, ServerApp);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[AffinityAddServer]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
},
/**
 * 亲和性批量增加Node
 * @param  {String}  Token                登录签名
 * @param  {Array}   NodeName             节点名
 * @param  {String}  ServerApp            应用
 */
AffinityController.AffinityAddNode = async(ctx) => {
    let { Token = '', NodeName = [], ServerApp = '' ,ServerName=""} = ctx.paramsObj
    try {
        let result = await AffinityService.affinityAddNode(NodeName, ServerApp , ServerName);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[AffinityAddNode]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
},
/**
 * 亲和性批量删除server
 * @param  {String}  Token                登录签名
 * @param  {String}  NodeName             节点名
 * @param  {Array}   ServerApp            应用
 */
AffinityController.AffinityDeleteServer = async(ctx) => {
    let { Token = '', NodeName = '', ServerApp = [] } = ctx.paramsObj

    try {
        let result = await AffinityService.affinityDeleteServer(NodeName, ServerApp);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[AffinityDeleteServer]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
},
/**
 * 亲和性批量删除Node
 * @param  {String}  Token                登录签名
 * @param  {Array}   NodeName             节点名
 * @param  {String}  ServerApp            应用
 */
AffinityController.AffinityDeleteNode = async(ctx) => {
    let {Token = '', NodeName = [], ServerApp = '', ServerName = "", Force = 'false'} = ctx.paramsObj
    try {

        let result = await AffinityService.affinityDeleteNode(NodeName, ServerApp, ServerName, Force);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[AffinityDeleteNode]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
},

module.exports = AffinityController;
