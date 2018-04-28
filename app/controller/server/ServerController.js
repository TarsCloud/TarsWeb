const logger = require('../../logger');
const ServerService = require('../../service/server/ServerService');

const util = require('../util/util');
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
    posttime: util.formatTimeStamp
};

const ServerController = {};
ServerController.getServerConfById = async(ctx) => {
    let id = ctx.paramsObj.id;
    try {
        let rst = await ServerService.getServerConfById(id);
        if(rst.length > 0){
            ctx.makeResObj(200, '', util.viewFilter(rst[0], serverConfStruct));
        }else{
            logger.error('[getServerConfById]', '未查询id相应的服务');
            ctx.makeErrResObj();
        }
    } catch (e) {
        logger.error('[getServerConfById]', e);
        ctx.makeErrResObj();
    }
};

ServerController.serverExist = async(ctx) => {
    let application = ctx.paramsObj.application;
    let serverName = ctx.paramsObj.server_name;
    let nodeName = ctx.paramsObj.node_name;
    try {
        ctx.makeResObj(200, '', (await ServerService.getServerConf(application, serverName, nodeName)).length > 0);
    } catch (e) {
        logger.error('[serverExist]', e);
        ctx.makeErrResObj();
    }
};

ServerController.getServerConfList4Tree = async(ctx) => {
    let treeNodeId = ctx.paramsObj.tree_node_id;
    let curPage = parseInt(ctx.paramsObj.cur_page) || 0;
    let pageSize = parseInt(ctx.paramsObj.page_size) || 0;
    try {
        let rst = await ServerService.getServerConfList4Tree(treeNodeId, curPage, pageSize);
        ctx.makeResObj(200, '', util.viewFilter(rst, serverConfStruct));
    } catch (e) {
        logger.error('[getServerConfList4Tree]', e);
        ctx.makeErrResObj();
    }
};

ServerController.getInactiveServerConfList = async(ctx) => {
    let application = ctx.paramsObj.application || '';
    let serverName = ctx.paramsObj.server_name || '';
    let nodeName = ctx.paramsObj.node_name || '';
    let curPage = parseInt(ctx.paramsObj.cur_page) || 0;
    let pageSize = parseInt(ctx.paramsObj.page_size) || 0;
    try {
        let rst = await ServerService.getInactiveServerConfList(application, serverName, nodeName, curPage, pageSize);
        ctx.makeResObj(200, '', util.viewFilter(rst, serverConfStruct));
    } catch (e) {
        logger.error('[getInactiveServerConfList]', e);
        ctx.makeErrResObj();
    }
};

ServerController.getRealtimeState = async(ctx)=> {
    let id = ctx.paramsObj.id;
    try {
        let rst = await ServerService.getServerConfById(id);
        if (rst.length) {
            ctx.makeResObj(200, '', {realtime_state: rst[0]['present_state']});
        } else {
            logger.warn('[getRealtimeState]', '未查询id相应的服务');
            ctx.makeErrResObj();
        }
    } catch (e) {
        logger.error('[getRealtimeState]', e);
        ctx.makeErrResObj();
    }
};

ServerController.updateServerConf = async(ctx) =>{
    let updateServer = ctx.paramsObj;
    let server = await ServerService.getServerConfById(updateServer.id);
    if (server.length) {
        server = server[0];
        Object.assign(server, updateServer);
        server.bak_flag = server.isBak? 1 : 0;
        server.enable_set = server.enable_set? 'Y' : 'N';
        server.posttime = new Date();
        try{
            let rst = await ServerService.updateServerConf(server);
            ctx.makeResObj(200, '', util.viewFilter(rst, serverConfStruct));
        }catch(e){
            logger.error('[updateServerConf]', e);
            ctx.makeErrResObj();
        }
    } else {
        logger.warn('[updateServerConf]', '未查询id相应的服务');
        ctx.makeErrResObj();
    }
}

module.exports = ServerController