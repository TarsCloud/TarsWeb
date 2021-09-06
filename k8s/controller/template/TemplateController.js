const logger = require('../../../logger')
const TemplateService = require('../../service/template/TemplateService');

const TemplateController = {};

/**
 * 模版创建
 * @param  {String}  Token                登录签名
 * @param  {String}  TemplateName         模板名
 * @param  {String}  TemplateParent       父模板名
 * @param  {String}  TemplateContent      模板内容
 * @param  {String}  CreateMark           模板备注
 */
TemplateController.TemplateCreate = async(ctx) => {
    let { Token = '',
        TemplateName = '', TemplateParent = '', TemplateContent = '', CreateMark = '',
    } = ctx.paramsObj
    
    try {
        const metadata = {
            TemplateName,
            TemplateParent,
            TemplateContent,
            CreateMark,
        }
        let result = await TemplateService.templateCreate(metadata);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[rpc_TemplateCreate]', e, ctx)
        ctx.makeErrResObj()
    }
},
/**
 * 模版列表
 * @param  {String}  Token                登录签名
 * @param  {String}  TemplateId           模版ID
 * @param  {String}  TemplateName         模版名
 * @param  {String}  TemplateParent       父模版名
 * @param  {String}  TemplateContent      模版内容
 * @param  {String}  CreatePerson         创建人
 * @param  {String}  CreateTime           创建时间
 * @param  {String}  CreateMark           创建备注
 * @param  {String}  UpdatePerson         更新人
 * @param  {String}  UpdateTime           更新时间
 * @param  {String}  UpdateMark           更新备注
 */
TemplateController.TemplateSelect = async(ctx) => {
    let { Token = '', TemplateName = '', ParentName='' } = ctx.paramsObj

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
        let result = await TemplateService.templateSelect(TemplateName, ParentName);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[TemplateSelect]', e, ctx)
        ctx.makeErrResObj()
    }
}

/**
 * 服务模版更新
 * @param  {String}  Token                登录签名
 * @param  {Number}  TemplateId           模版ID
 * @param  {String}  TemplateParent       父模板名
 * @param  {String}  TemplateContent      模板内容
 * @param  {String}  CreateMark           备注
 */
TemplateController. TemplateUpdate = async(ctx) => {
    let { Token = '', TemplateId = '', TemplateParent = '', TemplateContent = '', CreateMark = '' } = ctx.paramsObj

    try {
        const metadata = {
            TemplateId,
        }
        let target = {
            TemplateParent,
            TemplateContent,
            CreateMark,
        }

        let result = await TemplateService.templateUpdate(metadata, target);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[rpc_TemplateUpdate]', e, ctx)
        ctx.makeErrResObj()
    }
},
/**
 * 服务模版删除
 * @param  {String}  Token                登录签名
 * @param  {Number}  TemplateId           模版ID
 */
TemplateController. TemplateDelete = async(ctx)=> {
    let { Token = '', TemplateId = '' } = ctx.paramsObj

    try {
        const metadata = {
            TemplateId,
        }

        let result = await TemplateService.templateDelete(metadata);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[rpc_TemplateDelete]', e, ctx)
        ctx.makeErrResObj()
    }
},
    
module.exports = TemplateController;