const logger = require('../../logger');
const ServerService = require('../../service/server/ServerService');
const AdminService = require('../../service/admin/AdminService');
const _ = require('lodash');
const util = require('../../tools/util');
const AuthService = require('../../service/auth/AuthService');

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

const ServerController = {};


ServerController.getServerConfById = async(ctx) => {
    let id = ctx.paramsObj.id;
    try {
        var rst = await ServerService.getServerConfById(id);
        if (!_.isEmpty(rst)) {
            rst = rst.dataValues;
            if (!await AuthService.hasDevAuth(rst.application, rst.server_name, ctx.uid)) {
                ctx.makeNotAuthResObj();
            } else {
                ctx.makeResObj(200, '', util.viewFilter(rst, serverConfStruct));
            }
        } else {
            logger.error('[getServerConfById]', '未查询到id=' + id + '相应的服务');
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
        if (!await AuthService.hasDevAuth(application, serverName, ctx.uid)) {
            ctx.makeNotAuthResObj();
        } else {
            ctx.makeResObj(200, '', (await ServerService.getServerConf(application, serverName, nodeName)).length > 0);
        }
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
        let params = ServerController.formatTreeNodeId(treeNodeId);
        if (!await AuthService.hasDevAuth(params.application, params.serverName, ctx.uid)) {
            ctx.makeNotAuthResObj();
        } else {
            let rst = await ServerService.getServerConfList4Tree({
                application: params.application,
                serverName: params.serverName,
                enableSet: params.enableSet,
                setName: params.setName,
                setArea: params.setArea,
                setGroup: params.setGroup,
                curPage: curPage || 0,
                pageSize: pageSize || 0
            });
            ctx.makeResObj(200, '', util.viewFilter(rst, serverConfStruct));
        }
    } catch (e) {
        logger.error('[getServerConfList4Tree]', e);
        ctx.makeErrResObj();
    }
};

ServerController.formatTreeNodeId = (treeNodeId) => {
    let serverConf = {enableSet: 'N'};
    treeNodeId = treeNodeId.split('.');
    treeNodeId.forEach((s)=> {
        let i = parseInt(s.substring(0, 1));
        let v = s.substring(1);
        switch (i) {
            case 1:
                serverConf.application = v;
                break;
            case 2:
                serverConf.setName = v;
                serverConf.enableSet = 'Y';
                break;
            case 3:
                serverConf.setArea = v;
                serverConf.enableSet = 'Y';
                break;
            case 4:
                serverConf.setGroup = v;
                serverConf.enableSet = 'Y';
                break;
            case 5:
                serverConf.serverName = v;
                break;
            default:
                break;
        }
    });
    return serverConf;
};

ServerController.getInactiveServerConfList = async(ctx) => {
    let application = ctx.paramsObj.application || '';
    let serverName = ctx.paramsObj.server_name || '';
    let nodeName = ctx.paramsObj.node_name || '';
    let curPage = parseInt(ctx.paramsObj.cur_page) || 0;
    let pageSize = parseInt(ctx.paramsObj.page_size) || 0;
    try {
        if (!await AuthService.hasDevAuth(application, serverName, ctx.uid)) {
            ctx.makeNotAuthResObj();
        } else {
            let rst = await ServerService.getInactiveServerConfList(application, serverName, nodeName, curPage, pageSize);
            ctx.makeResObj(200, '', util.viewFilter(rst, serverConfStruct));
        }
    } catch (e) {
        logger.error('[getInactiveServerConfList]', e);
        ctx.makeErrResObj();
    }
};

ServerController.getRealtimeState = async(ctx)=> {
    let id = ctx.paramsObj.id;
    try {
        let rst = await ServerService.getServerConfById(id);
        if (!_.isEmpty(rst)) {
            rst = rst.dataValues;
            if (!await AuthService.hasDevAuth(rst.application, rst.server_name, ctx.uid)) {
                ctx.makeNotAuthResObj();
            } else {
                ctx.makeResObj(200, '', {realtime_state: rst['present_state']});
            }
        } else {
            logger.error('[getRealtimeState]', '未查询到id=' + id + '相应的服务');
            ctx.makeErrResObj();
        }
    } catch (e) {
        logger.error('[getRealtimeState]', e);
        ctx.makeErrResObj();
    }
};

ServerController.updateServerConf = async(ctx) => {
    try{
        let updateServer = ctx.paramsObj;
        let server = await ServerService.getServerConfById(updateServer.id);
        if (!_.isEmpty(server)) {
            if (!await AuthService.hasDevAuth(server.application, server.server_name, ctx.uid)) {
                ctx.makeNotAuthResObj();
                return;
            }

            // let operator = updateServer.operator;
            // let developer = updateServer.developer;
            // delete(updateServer.operator);
            // delete(updateServer.developer);
            // await AuthService.modifyAuth(server.application, server.server_name, operator, developer);

            Object.assign(server, updateServer);
            server.bak_flag = server.isBak ? 1 : 0;
            server.enable_set = server.enable_set ? 'Y' : 'N';
            server.posttime = new Date();
            await ServerService.updateServerConf(server);
            ctx.makeResObj(200, '', util.viewFilter(await ServerService.getServerConfById(updateServer.id), serverConfStruct));
        } else {
            logger.error('[updateServerConf]', '未查询到id=' + updateServer.id + '相应的服务');
            ctx.makeErrResObj();
        }
    }catch(e){
        logger.error('[updateServerConf]', e);
        ctx.makeErrResObj();
    }

};

ServerController.loadServer = async(ctx) => {
    let application = ctx.paramsObj.application;
    let serverName = ctx.paramsObj.server_name;
    let nodeName = ctx.paramsObj.node_name;
    try {
        if (!await AuthService.hasDevAuth(application, serverName, ctx.uid)) {
            ctx.makeNotAuthResObj();
        } else {
            let ret = await AdminService.loadServer(application, serverName, nodeName);
            ctx.makeResObj(200, '', ret);
        }
    } catch (e) {
        logger.error('[loadServer]', e);
        ctx.makeErrResObj();
    }
};

module.exports = ServerController;