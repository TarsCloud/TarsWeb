/**
 * Created by clauseliu on 2018/5/21.
 */
const logger = require('../../logger');
const AdminService = require('../../service/admin/AdminService');
const TCPClient = require('./TCPClient');
const Mysql = require('mysql');

const MonitorPropertyService = {};

MonitorPropertyService.getTARSPropertyMonitorData = async (params) => {
    let theData = await call(params, true),
        preData = await call(params, false);
    return merge(params, theData, preData);
};


/**
 * 处理显示日期和对比日期查询条件
 * @param params
 * @param the 是否当前日期
 */
async function call(params, the) {
    let date = the ? params.thedate : params.predate,
        conditions = [],
        startshowtime = params.startshowtime || '0000',
        endshowtime = params.endshowtime || '2360';
    conditions.push(`f_date=${Mysql.escape(date)}`);
    conditions.push(`f_tflag>=${Mysql.escape(startshowtime)}`);
    conditions.push(`f_tflag<=${Mysql.escape(endshowtime)}`);
    if(params.master_name) {
        conditions.push(`master_name like ${Mysql.escape(params.master_name)}`);
    }
    if(params.property_name) {
        conditions.push(`property_name like ${Mysql.escape(params.property_name)}`);
    }
    if(params.policy) {
        conditions.push(`policy like ${Mysql.escape(params.policy)}`);
    }
    if(params.master_ip) {
        conditions.push(`master_ip like ${Mysql.escape(params.master_ip)}`);
    }
    let requestObj = {
        groupby : params.group_by ? ['f_date', params.group_by] : ['f_tflag'],
        method : 'query',
        dataid : 'tars_property',
        filter : conditions,
        indexs : ['value']
    };
    let addrs = await AdminService.getEndpoints("tars.tarsqueryproperty.NoTarsObj").catch(err => {
        logger.error('[AdminService.getEndpoints]:',err.toString());
    });
    if(!addrs || !addrs.length) {
        logger.error('[AdminService.getEndpoints]:','tars.tarsqueryproperty.NoTarsObj not found');
        return;
    }
    let addr0 = addrs[0];
    logger.info(`tars.tarsqueryproperty.NoTarsObj, use ${addr0.host}:${addr0.port}`);
    return await TCPClient(addr0.host, addr0.port, requestObj);
}

function merge(params, theData, preData) {
    let result = [];
    let set = mergeKey(params, theData, preData);
    for(let item of set) {
        let thevalue = theData.get(item),
            prevalue = preData.get(item),
            thevalueOutput = formatValue(thevalue),
            prevalueOutput = formatValue(prevalue);


        let tmpObj = {
            property_name : params.property_name || '%',
            master_ip : params.master_ip || '%',
            master_name : params.master_name || '%',
            policy : params.policy || '%',

            the_value : thevalueOutput[0],
            pre_value : prevalueOutput[0]
        };

        let groupby = params.group_by ? ['f_date', params.group_by] : ['f_tflag'];
        for(let i=0;i<groupby.length;i++) {
            let callGroup = groupby[i],
                key = item.split(','),
                callGroupValue = key[i];

            switch (callGroup) {
                case 'f_date' :
                    tmpObj.show_date = callGroupValue;
                    break;
                case 'f_tflag' :
                    tmpObj.show_time = callGroupValue;
                    break;
                case 'master_name' :
                    tmpObj.master_name = callGroupValue;
                    break;
                case 'property_name' :
                    tmpObj.property_name = callGroupValue;
                    break;
                case 'policy' :
                    tmpObj.policy = callGroupValue;
                    break;
                case 'master_ip' :
                    tmpObj.master_ip = callGroupValue;
                    break;
            }
        }
        result.push(tmpObj);
    }
    return result;
}

function mergeKey(params, theData, preData) {
    let set = new Set();
    for(let key of theData.keys()) {
        set.add(key);
    }
    for(let key of preData.keys()) {
        key = key.split(',');
        if(key.length > 1) {
            key[0] = params.thedate;
        }
        set.add(key.join(','));
    }
    return set;
}

function formatValue(data) {
    if(!data) {
        return ['--'];
    }
    let ret = [];
    ret[0] = data[0] < 0 ? '--' : parseInt(data[0]).toFixed(3);
    ret[0] = ret[0].replace(/[\\.]*[0]+$/, '');
    return ret;
}

module.exports = MonitorPropertyService;