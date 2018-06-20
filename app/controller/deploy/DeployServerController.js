const logger = require('../../logger');
const ServerService = require('../../service/server/ServerService');
const DeployServerController = {};
const util = require('../../tools/util');

const serverConfStruct = {
    id: '',
    application: '',
    server_name: '',
    node_name: '',
    server_type: '',
    enable_set: {formatter: (value)=>{return value == 'Y' ? true : false;}},
    set_name: '',
    set_area: '',
    set_group: '',
    setting_state: '',
    present_state: '',
    bak_flag: {formatter: (value)=>{return value == 0 ? false : true;}},
    template_name: '',
    profile: '',
    async_thread_num: '',
    base_path: '',
    exe_path: '',
    start_script_path: '',
    stop_script_path: '',
    monitor_script_path: '',
    patch_time: util.formatTimeStamp,
    patch_version: "",
    process_id: '',
    posttime: {formatter: util.formatTimeStamp}
};

DeployServerController.deployServer = async(ctx) => {
    var params = ctx.paramsObj;
    try {
        let rst = await ServerService.addServerConf(params);
        // ctx.makeResObj(200, '', util.viewFilter(rst, serverConfStruct));
        ctx.makeResObj(200, '', rst);
    } catch (e) {
        logger.error('[getServerNotifyList]', e);
        ctx.makeErrResObj();
    }
};


module.exports = DeployServerController;