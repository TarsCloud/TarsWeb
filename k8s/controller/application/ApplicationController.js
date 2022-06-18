const logger = require('../../../logger')
const ApplicationService = require('../../service/application/ApplicationService');

const ApplicationController = {};

/**
 * 应用创建
 */
ApplicationController.ApplicationCreate = async (ctx) => {
    let {
        Token = '',
            ServerApp = '', AppMark = '', BusinessName = '',
    } = ctx.paramsObj

    try {
        const metadata = {
            ServerApp,
            AppMark,
            BusinessName,
        }

        let result = await ApplicationService.applicationCreate(metadata);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[ApplicationCreate]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

/**
 * 应用列表
 */
ApplicationController.ApplicationSelect = async (ctx) => {
    let {
        Token = '', page = 1, isAll = "true",
            ServerApp = '', BusinessName = '',
    } = ctx.paramsObj

    isAll = isAll == "true";

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

        let result = await ApplicationService.applicationSelect(isAll, ServerApp, BusinessName, limiter);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[ApplicationSelect]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

/**
 * 应用更新
 */
ApplicationController.ApplicationUpdate = async (ctx) => {
    let {
        Token = '', ServerApp = '', AppMark = '', BusinessName = ''
    } = ctx.paramsObj

    try {
        const metadata = {
            ServerApp,
        }
        let target = {
            AppMark,
            BusinessName,
        }

        let result = await ApplicationService.applicationUpdate(metadata, target);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[ApplicationUpdate]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

/**
 * 应用删除
 */
ApplicationController.ApplicationDelete = async (ctx) => {
    let {
        Token = '', ServerApp = ''
    } = ctx.paramsObj

    try {
        const metadata = {
            ServerApp,
        }

        let result = await ApplicationService.applicationDelete(metadata);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[ApplicationDelete]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

module.exports = ApplicationController;