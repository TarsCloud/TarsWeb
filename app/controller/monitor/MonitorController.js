const logger = require('../../logger');
const util = require('../../tools/util');
const MonitorStatService = require('../../service/monitor/MonitorStatService');
const MonitorPropertyService = require('../../service/monitor/MonitorPropertyService');

const MonitorController = {};

MonitorController.tarsstat = async (ctx) => {
    let {thedate, predate, startshowtime, endshowtime, master_name, slave_name, interface_name, master_ip, slave_ip, group_by} = ctx.paramsObj;
    try {
        let list = await MonitorStatService.getTARSStatMonitorData({thedate, predate, startshowtime, endshowtime, master_name, slave_name, interface_name, master_ip, slave_ip, group_by});
        ctx.makeResObj(200,'',util.viewFilter(list, {
            show_date: '',
            show_time: '',
            master_name: '',
            slave_name: '',
            interface_name: '',
            master_ip: '',
            slave_ip: '',
            the_total_count: '',
            pre_total_count: '',
            total_count_wave: '',
            the_avg_time: '',
            pre_avg_time: '',
            the_fail_rate: '',
            pre_fail_rate: '',
            the_timeout_rate: '',
            pre_timeout_rate: '',
        }));
    }catch(e) {
        logger.error(e);
        ctx.makeErrResObj(500, e.toString());
    }
};

MonitorController.tarsproperty = async (ctx) => {
    let {thedate, predate, startshowtime, endshowtime, master_name, master_ip, property_name, policy} = ctx.paramsObj;
    try {
        let list = await MonitorPropertyService.getTARSPropertyMonitorData({thedate, predate, startshowtime, endshowtime, master_name, master_ip, property_name, policy});
        ctx.makeResObj(200,'',util.viewFilter(list,{show_date:'',show_time:'',master_name:'',master_ip:'',property_name:'',policy:'',the_value:'',pre_value:''}));
    }catch(e) {
        logger.error(e);
        ctx.makeErrResObj(500, e.toString());
    }
};

module.exports = MonitorController;