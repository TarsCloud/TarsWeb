/**
 * Created by clauseliu on 2018/5/21.
 */
const logger = require('../../logger');
const AdminService = require('../../service/admin/AdminService');
const TCPClient = require('./TCPClient');

const MonitorStatService = {};

MonitorStatService.getTARSStatMonitorData = async (params) => {
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
    conditions.push(`f_date='${date}'`);
    conditions.push(`f_tflag>='${startshowtime}'`);
    conditions.push(`f_tflag<='${endshowtime}'`);
    if(params.master_name) {
        conditions.push(`master_name like '${params.master_name}'`);
    }
    if(params.slave_name) {
        conditions.push(`slave_name like '${params.slave_name}'`);
    }
    if(params.interface_name) {
        conditions.push(`interface_name like '${params.interface_name}'`);
    }
    if(params.master_ip) {
        conditions.push(`master_ip like '${params.master_ip}'`);
    }
    if(params.slave_ip) {
        conditions.push(`slave_ip like '${params.slave_ip}'`);
    }
    let requestObj = {
        groupby : params.group_by ? ['f_date', params.group_by] : ['f_tflag'],
        method : 'query',
        dataid : 'tars_stat',
        filter : conditions,
        indexs : ['succ_count', 'timeout_count', 'exce_count', 'total_time']
    };
    let addrs = await AdminService.getEndpoints("tars.tarsquerystat.NoTarsObj");
    //addrs = [['localhost','80']]; // 测试的,假定真实环境传给我这样的数据结构
    if(!addrs || !addrs.length) {
        logger.error('[AdminService.getEndpoints]:','tars.tarsquerystat.NoTarsObj not found');
        console.error('[AdminService.getEndpoints]:','tars.tarsquerystat.NoTarsObj not found');
        return;
    }
    let addr0 = addrs[0];
    logger.info(`tars.tarsquerystat.NoTarsObj, use ${addr0[0]}:${addr0[1]}`);
    return await TCPClient(addr0[0], addr0[1], requestObj);
}

function merge(params, theData, preData) {
    let result = [];
    let set = mergeKey(params, theData, preData);
    for(let item of set) {
        let thevalue = translate(theData.get(item)),
            prevalue = translate(preData.get(item)),
            thevalueOutput = formatValue(thevalue),
            prevalueOutput = formatValue(prevalue),
            totalCountWave = '';
        if (thevalue[0] < 0 || prevalue[0] < 0) {
            totalCountWave = '--';
        } else {
            if (prevalue[0] == 0) {
                if (thevalue[0] == 0) {
                    totalCountWave = '0%';
                } else {
                    totalCountWave = '+∞%';
                }
            } else {
                let wave = (thevalue[0] - prevalue[0]) / prevalue[0];
                totalCountWave = (wave * 100).toFixed(2) + '%';
            }
        }

        let tmpObj = {
            interface_name : params.interface_name || '%',
            master_ip : params.master_ip || '%',
            master_name : params.master_name || '%',
            slave_name : params.slave_name || '%',
            slave_ip : params.slave_ip || '%',

            the_total_count : thevalueOutput[0],
            the_avg_time : thevalueOutput[1],
            the_fail_rate : thevalueOutput[2],
            the_timeout_rate : thevalueOutput[3],

            pre_total_count : prevalueOutput[0],
            pre_avg_time : prevalueOutput[1],
            pre_fail_rate : prevalueOutput[2],
            pre_timeout_rate : prevalueOutput[3],

            total_count_wave : totalCountWave
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
                case 'slave_name' :
                    tmpObj.slave_name = callGroupValue;
                    break;
                case 'interface_name' :
                    tmpObj.interface_name = callGroupValue;
                    break;
                case 'master_ip' :
                    tmpObj.master_ip = callGroupValue;
                    break;
                case 'slave_ip' :
                    tmpObj.slave_ip = callGroupValue;
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

function translate(data) {
    if(!data) {
        return [-1, -1, -1, -1];
    }
    let ret = [];
    let total = parseInt(data[0]) + parseInt(data[1]) + parseInt(data[2]);
    ret[0] = total;
    ret[1] = total == 0 ? -1 : data[3] / total;
    ret[2] = total == 0 ? -1 : data[2] / total;
    ret[3] = total == 0 ? -1 : data[1] / total;
    return ret;
}

function formatValue(data) {
    let ret = [];
    ret[0] = data[0] < 0 ? '--' : data[0].toFixed(2);
    ret[1] = data[1] < 0 ? '--' : data[1].toFixed(2);
    ret[2] = data[2] < 0 ? '--' : (data[2]*100).toFixed(2) + '%';
    ret[3] = data[3] < 0 ? '--' : (data[3]*100).toFixed(2) + '%';
    return ret;
}




module.exports = MonitorStatService;