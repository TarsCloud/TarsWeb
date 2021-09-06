const logger = require('../../../logger')
const HPAService = require('../../service/hpa/HPAService');
const HPAController = {};

HPAController.HPACreate = async (ctx) => {
    let {ServerId, minReplicas, maxReplicas, indicatorData, serverData} = ctx.paramsObj
    try {
        let target = {
            minReplicas, maxReplicas, indicatorData,
            version: serverData.version,
            kind: serverData.kind,
            name: serverData.name
        }
        let result = await HPAService.HPACreate(ServerId, target);
        ctx.makeResObj(result.ret, result.msg, result.data);
    } catch (e) {
        logger.error('[HPACreate]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}
HPAController.getHPAByName = async (ctx) => {
    let {serverId} = ctx.paramsObj
    try {
        let result = await HPAService.getHPAByName(serverId);
        ctx.makeResObj(result.ret, result.msg, result.data);
    } catch (e) {
        logger.error('[getHPAByName]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

HPAController.getHPACustomTarget = async (ctx) => {
    try {
        let targets = await HPAService.getHPACustomTarget();
        ctx.makeResObj(200, "", HPAService.SYS_TARGET.concat(targets));
    } catch (e) {
        logger.error('[getHPACustomTarget error!!]')
        ctx.makeResObj(200, "", HPAService.SYS_TARGET.concat(HPAService.CUSTOM_TARGET));//没查询到展示3个通用指标
    }
}

module.exports = HPAController;
