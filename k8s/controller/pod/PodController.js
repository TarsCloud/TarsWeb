const logger = require('../../../logger')
const CommonService = require('../../service/common/CommonService');
const PodService = require('../../service/pod/PodService');
const ImageService = require("../../service/image/ImageService");

const PodController = {};

PodController.PodSearch = async (ctx) => {
    let {searchkey, c} = ctx.paramsObj

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
 * @param  {String}  Token                登录签名
 * @param  {String}  PodId                Pod ID
 * @param  {String}  PodName              Pod名称
 * @param  {String}  PodIp                Pod IP
 * @param  {String}  ServerId             服务ID
 * @param  {String}  ServerApp            服务应用
 * @param  {String}  ServerName           服务名称
 * @param  {Number}  ServiceVersion       服务版本
 * @param  {String}  SettingState         设置状态
 * @param  {String}  PresentState         当前状态
 * @param  {String}  CreateTime           创建时间
 * @param  {String}  UpdateTime           更新时间
 */
PodController.PodAliveSelect = async (ctx) => {
    const that = module.exports

    let {Token = '', ServerId = ''} = ctx.paramsObj

    let filter = {
        eq: {},
    }

    CommonService.addEqFilter(filter, ServerId);

    try {

        let result = await PodService.podAliveSelect(filter);

        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[PodAliveSelect]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

/**
 * Pod历史列表
 * @param  {String}  Token                登录签名
 * @param  {String}  PodId                Pod ID
 * @param  {String}  PodName              Pod名称
 * @param  {String}  PodIp                Pod IP
 * @param  {Number}  ServerId             服务ID
 * @param  {String}  ServerApp            服务应用
 * @param  {String}  ServerName           服务名称
 * @param  {String}  CreateTime           创建时间
 * @param  {String}  DeleteTime           删除时间
 */
PodController.PodPerishedSelect = async (ctx) => {
    const that = module.exports

    let {Token = '', ServerId = ''} = ctx.paramsObj

    try {
        let result = await PodService.podPerishedSelect(ServerId);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        // console.log(e);
        logger.error('[PodPerishedSelect]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

//删除pod
PodController.deletePod = async (ctx) => {
    let {Token = '', PodName = ''} = ctx.paramsObj
    try {
        let result = await PodService.deletePod(PodName);
        ctx.makeResObj(result.ret, result.msg, result.data);
    } catch (e) {
        logger.error('[deletePod]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}
module.exports = PodController;
