const logger = require('../../../logger')
const ApprovalService = require('../../service/approval/ApprovalService');

const ApprovalController = {};

/**
 * 服务审批
 */
ApprovalController.ServerApprovalCreate = async (ctx) => {
    // let { Token = '', ApprovalId = 0,
    //     ApprovalResult = false, ApprovalMark = '',
    // } = ctx.paramsObj

    let metadata = ctx.paramsObj;

    if(`${metadata.ApprovalResult}` === 'true') {
        metadata.ApprovalResult = true
    }else if(`${metadata.ApprovalResult}` === 'false'){
        metadata.ApprovalResult = false
    }
   
    // console.log(metadata);
    try {
        // const metadata = {
        //     ApprovalId,
        //     ApprovalResult,
        //     ApprovalMark,
        // }

        let result = await ApprovalService.serverApprovalCreate(metadata);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[ServerApprovalCreate]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
},
/**
 * 服务审批列表
 */
ApprovalController.ServerApprovalSelect = async(ctx) => {
    const that = module.exports

    let { Token = '',
        Continue
        // page = 1, isAll = false,
    } = ctx.paramsObj

    // isAll = isAll == "true";

    // let pageIndex = Math.floor(page) || 1
    // let pageSize = 10

    // let limiter = null;
    // if(!isAll){
    //     limiter = {
    //         offset: (pageIndex - 1) * pageSize,
    //         rows: pageSize,
    //     }
    // }

    try {
        // const order = [
        //     { column: 'RequestTime', order: 'desc' },
        // ]

        let result = await ApprovalService.serverApprovalSelect(Continue);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[ServerApprovalSelect]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
},
    
module.exports = ApprovalController;