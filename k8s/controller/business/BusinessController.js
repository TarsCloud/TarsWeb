const logger = require('../../../logger')
const BusinessService = require('../../service/business/BusinessService');

const BusinessController = {};
/**
 * 业务创建
 */
BusinessController.BusinessCreate = async (ctx) => {
    let {
        Token = '',
            BusinessName = '', BusinessShow = '', BusinessMark = '', BusinessOrder = 0,
    } = ctx.paramsObj

    BusinessOrder = Math.floor(BusinessOrder) || 0

    try {
        const metadata = {
            BusinessName,
            BusinessShow,
            BusinessMark,
            BusinessOrder,
        }

        let result = await BusinessService.businessCreate(metadata);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[BusinessCreate]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
};
/**
 * 业务列表
 */
BusinessController.BusinessSelect = async (ctx) => {
    let {
        Token = '', page = 1, isAll = false,
            BusinessName = '', BusinessShow = '', BusinessMark = '',
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

        let result = await BusinessService.businessSelect(isAll, BusinessName, BusinessShow, BusinessMark, limiter);
        ctx.makeResObj(result.ret, result.msg, result.data);
    } catch (e) {
        logger.error('[BusinessSelect]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
};
/**
 * 业务更新
 */
BusinessController.BusinessUpdate = async (ctx) => {
    let {
        Token = '',
            BusinessName = '', BusinessShow = '', BusinessMark = '', BusinessOrder = 0,
    } = ctx.paramsObj

    BusinessOrder = Math.floor(BusinessOrder) || 0

    try {
        const metadata = {
            BusinessName,
        }
        let target = {
            BusinessShow,
            BusinessMark,
            BusinessOrder,
        }

        let result = await BusinessService.businessUpdate(metadata, target);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[BusinessUpdate]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
};
/**
 * 业务删除
 */
BusinessController.BusinessDelete = async (ctx) => {
    let {
        Token = '', BusinessName = ''
    } = ctx.paramsObj

    try {
        const metadata = {
            BusinessName,
        }

        let result = await BusinessService.businessDelete(metadata);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[BusinessDelete]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
};
/**
 * 业务添加APP
 */
BusinessController.BusinessAddApp = async (ctx) => {
    let {
        Token = '',
            BusinessName = '', AppNames = [],
    } = ctx.paramsObj

    try {
        const metadata = {
            BusinessName,
            AppNames,
        }

        let result = await BusinessService.businessAddApp(metadata);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[BusinessAddApp]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
};
/**
 * 业务聚合App
 */
BusinessController.BusinessListByApp = async (ctx) => {
    let {
        Token = '',
            BusinessNames = [],
    } = ctx.paramsObj

    try {
        let result = await BusinessService.businessListByApp(BusinessNames);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[BusinessListByApp]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
};

module.exports = BusinessController;