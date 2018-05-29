/**
 * Created by clauseliu on 2018/5/21.
 */
const logger = require('../../logger');
const util = require('../../tools/util');
const MonitorService = require('../../service/monitor/MonitorService');

const MonitorController = {};

MonitorController.tarsstat = async (ctx) => {
    let {thedate, predate, startshowtime, endshowtime, master_name, slave_name, interface_name, master_ip, slave_ip} = ctx.paramsObj;
    try {
        let list = await MonitorService.getTARSStatMonitorData({thedate, predate, startshowtime, endshowtime, master_name, slave_name, interface_name, master_ip, slave_ip});
        ctx.makeResObj(200,'',util.viewFilter(list,{id:'',server:'',tgz:'',update_text:{key:'comment'},posttime:{formatter:util.formatTimeStamp}}));
    }catch(e) {
        logger.error(e);
        ctx.makeErrResObj(500, e.toString());
    }
};

MonitorController.tarsproperty = async (ctx) => {
    let {thedate, predate, startshowtime, endshowtime, master_name, master_ip, property_name, policy} = ctx.paramsObj;
    try {
        let list = await MonitorService.getTARSPropertyMonitorData();
        ctx.makeResObj(200,'',util.viewFilter(list,{id:'',server:'',tgz:'',update_text:{key:'comment'},posttime:{formatter:util.formatTimeStamp}}));
    }catch(e) {
        logger.error(e);
        ctx.makeErrResObj(500, e.toString());
    }
};

module.exports = MonitorController;