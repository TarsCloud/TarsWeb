/**
 * Created by clauseliu on 2018/5/21.
 */
const logger = require('../../logger');
const AdminService = require('../../service/admin/AdminService');

const MonitorService = {};

MonitorService.getTARSStatMonitorData = async (params) => {
    let theData = call(params, true),
        preData = call(params, false);
    return params;
};

MonitorService.getTARSPropertyMonitorData = async (params) => {

};


/**
 * 处理显示日期和对比日期查询条件
 * @param params
 * @param the 是否显示日期
 */
async function call(params, the) {
    let date = the ? params.thedate : params.predate;
    let requestObj = {
        groupby : params.groupBy ? ['f_date', params.groupBy] : ['f_tflag'],
        method : 'query',
        dataid : 'tars_stat',
        filter : params,
        indexs : ['succ_count', 'timeout_count', 'exce_count', 'total_time']
    };

    let addrs = await AdminService.getEndpoints("tars.tarsquerystat.NoTarsObj");
    if(!addrs || !addrs.length) {
        console.error('[AdminService.getEndpoints]:','tars.tarsquerystat.NoTarsObj not found');
    }
    let addr0 = addrs[0];
    logger.info(`tars.tarsquerystat.NoTarsObj, use ${addr0.ip}:${addr0.port}`);
    return addrs;
}

module.exports = MonitorService;