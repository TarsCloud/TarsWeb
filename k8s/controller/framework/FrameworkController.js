/**
 * @date: 2022-01-04 14:10
 * @description：集群级别处理控制器
 */
const logger = require('../../../logger')
const FrameworkService = require('../../service/framework/FrameworkService');

const FrameworkController = {};

FrameworkController.getFrameworkConfig = async (ctx) => {
    try {
        let result = await FrameworkService.getFrameworkConfig();
        ctx.makeResObj(200, "", result);
    } catch (e) {
        logger.error('[getFrameworkConfig]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

FrameworkController.saveFrameworkConfig = async (ctx) => {
    try {
        let result = await FrameworkService.saveFrameworkConfig(ctx.paramsObj);
        ctx.makeResObj(200, "", result);
    } catch (e) {
        logger.error('[saveFrameworkConfig]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

module.exports = FrameworkController;