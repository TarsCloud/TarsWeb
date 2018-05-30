const logger = require('../../logger');
const ExpandService = require('../../service/expand/ExpandService');
const util = require('../../tools/util');
const AuthService = require('../../service/auth/AuthService');

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
    enable_set: {
        formatter: (value)=> {
            return value == 'Y' ? true : false;
        }
    },
    set_name: '',
    set_area: '',
    set_group: '',
    setting_state: '',
    present_state: '',
    bak_flag: {
        formatter: (value)=> {
            return value == 0 ? false : true;
        }
    },
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

ExpandServerController.selectAppServer = async(ctx) => {
    try{
        let params = ctx.paramsObj;
        let level = params.level;
        let application = params.application;
        let serverName = params.server_name;
        let set = params.set;
        let rst = [];
        let uid = ctx.uid;
        switch(parseInt(level)){
            case 1:
                rst = await ExpandService.getApplication(uid);
                break;
            case 2:
                rst = await ExpandService.getServerName(application, uid);
                break;
            case 3:
                rst = await ExpandService.getSet(application, serverName);
                break;
            case 4:
                rst = await ExpandService.getNodeName(application, serverName, set);
                break;
            default:
                break;
        }
        ctx.makeResObj(200, '', rst);
    }catch(e){
        logger.error(e);
        ctx.makeErrResObj();
    }
};

ExpandServerController.expandServerPreview = async(ctx) => {
    var params = ctx.paramsObj;
    try {
        if (!await AuthService.hasDevAuth(params.application, params.server_name, ctx.uid)) {
            ctx.makeNotAuthResObj();
        } else {
            let rst = await ExpandService.preview(params);
            ctx.makeResObj(200, '', util.viewFilter(rst, expandStruct));
        }
    } catch (e) {
        logger.error('[expandServerPreview]', e);
        ctx.makeErrResObj();
    }
};

ExpandServerController.expandServer = async(ctx) => {
    var params = ctx.paramsObj;
    try {
        if (!await AuthService.hasDevAuth(params.application, params.server_name, ctx.uid)) {
            ctx.makeNotAuthResObj();
        } else {
            let rst = await ExpandService.expand(params);
            ctx.makeResObj(200, '', util.viewFilter(rst, serverConfStruct));
        }
    } catch (e) {
        logger.error('[expandServerPreview]', e);
        ctx.makeErrResObj();
    }
};

module.exports = ExpandServerController;