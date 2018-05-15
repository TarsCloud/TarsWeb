const logger = require('../../logger');
const ExpandService = require('../../service/expand/ExpandService');
const util = require('../../tools/util');

const expandStruct = {
    application: '',
    server_name: '',
    set: '',
    obj_name: '',
    node_name: '',
    bind_ip: '',
    port: '',
    template_name: '',
    status: '',
    auth: ''
};

const serverConfStruct = {
    id: '',
    application: '',
    server_name: '',
    node_name: '',
    server_type: '',
    enable_set: '',
    set_name: '',
    set_area: '',
    set_group: '',
    setting_state: '',
    present_state: '',
    bak_flag: '',
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


const ExpandServerController = {};
ExpandServerController.expandServerPreview = async(ctx) => {
    var params = ctx.paramsObj;
    try {
        let rst = await ExpandService.preview(params);
        ctx.makeResObj(200, '', util.viewFilter(rst, expandStruct));
    } catch (e) {
        logger.error('[expandServerPreview]', e);
        ctx.makeErrResObj();
    }
};

ExpandServerController.expandServer = async(ctx) => {
    var params = ctx.paramsObj;
    try {
        let rst = await ExpandService.expand(params);
        ctx.makeResObj(200, '', util.viewFilter(rst, serverConfStruct));
    } catch (e) {
        logger.error('[expandServerPreview]', e);
        ctx.makeErrResObj();
    }
};


module.exports = ExpandServerController;