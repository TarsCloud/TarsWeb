/**
 * Tencent is pleased to support the open source community by making Tars available.
 *
 * Copyright (C) 2016THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the BSD 3-Clause License (the "License"); you may not use this file except 
 * in compliance with the License. You may obtain a copy of the License at
 *
 * https://opensource.org/licenses/BSD-3-Clause
 *
 * Unless required by applicable law or agreed to in writing, software distributed 
 * under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR 
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the 
 * specific language governing permissions and limitations under the License.
 */
 
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
    patch_time: {formatter: util.formatTimeStamp},
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
            logger.error('[getServerConfById]', '未查询到id=' + id + '相应的服务', ctx);
            ctx.makeErrResObj();
        }
    } catch (e) {
        logger.error('[getServerConfById]', e, ctx);
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
        logger.error('[serverExist]', e, ctx);
        ctx.makeErrResObj();
    }
};

ServerController.getServerConfList4Tree = async(ctx) => {
    let treeNodeId = ctx.paramsObj.tree_node_id;
    let curPage = parseInt(ctx.paramsObj.cur_page) || 0;
    let pageSize = parseInt(ctx.paramsObj.page_size) || 0;
    try {
        let params = ServerController.formatTreeNodeId(treeNodeId);
        if(await AuthService.hasAdminAuth(ctx.uid)){
            ctx.makeResObj(200, '', util.viewFilter(await ServerService.getServerConfList4Tree({
                application: params.application,
                serverName: params.serverName,
                enableSet: params.enableSet,
                setName: params.setName,
                setArea: params.setArea,
                setGroup: params.setGroup,
                curPage: curPage || 0,
                pageSize: pageSize || 0
            }), serverConfStruct));
        }else if (params.application && params.serverName) {   //若在服务页面，则直接检测是否有权限
            if (!await AuthService.hasDevAuth(params.application, params.serverName, ctx.uid)) {
                ctx.makeNotAuthResObj();
            } else {
                ctx.makeResObj(200, '', util.viewFilter(await ServerService.getServerConfList4Tree({
                    application: params.application,
                    serverName: params.serverName,
                    enableSet: params.enableSet,
                    setName: params.setName,
                    setArea: params.setArea,
                    setGroup: params.setGroup,
                    curPage: curPage || 0,
                    pageSize: pageSize || 0
                }), serverConfStruct));
            }
        } else {   //若非服务页面，比如应用页面，set页面，需先获取用户相关权限进行合并
            let serverList = await ServerService.getServerConfList4Tree({
                application: params.application,
                setName: params.setName,
                setArea: params.setArea,
                setGroup: params.setGroup,
                curPage: curPage || 0,
                pageSize: pageSize || 0
            });
            let authList = await AuthService.getAuthListByUid(ctx.uid);
            let rst = [];
            _.each(authList, (auth)=> {
                let application = auth.application;
                let serverName = auth.serverName;
                if (!serverName && application == params.application) {
                    rst = serverList;
                    return false;
                }
                serverList.forEach((server)=>{
                    if(server.application == application && server.server_name == serverName){
                        rst.push(server);
                    }
                });
            });
            ctx.makeResObj(200, '', util.viewFilter(rst, serverConfStruct));
        }
    } catch (e) {
        logger.error('[getServerConfList4Tree]', e, ctx);
        ctx.makeErrResObj();
    }
};

ServerController.formatTreeNodeId = (treeNodeId) => {
    let serverConf = {};
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
        logger.error('[getInactiveServerConfList]', e, ctx);
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
            logger.error('[getRealtimeState]', '未查询到id=' + id + '相应的服务', ctx);
            ctx.makeErrResObj();
        }
    } catch (e) {
        logger.error('[getRealtimeState]', e, ctx);
        ctx.makeErrResObj();
    }
};

ServerController.updateServerConf = async(ctx) => {
    try {
        let updateServer = ctx.paramsObj;
        let server = await ServerService.getServerConfById(updateServer.id);
        if (!_.isEmpty(server)) {
            if (!await AuthService.hasDevAuth(server.application, server.server_name, ctx.uid)) {
                ctx.makeNotAuthResObj();
                return;
            }
            Object.assign(server, updateServer);
            server.bak_flag = server.isBak ? 1 : 0;
            server.enable_set = server.enable_set ? 'Y' : 'N';
            if(server.enable_set == 'Y' && parseInt(server.set_group) != server.set_group){
                ctx.makeResObj(500, '#serverList.dlg.errMsg.setGroup#');
                return;
            }
            server.posttime = new Date();
            await ServerService.updateServerConf(server);
            ctx.makeResObj(200, '', util.viewFilter(await ServerService.getServerConfById(updateServer.id), serverConfStruct));
        } else {
            logger.error('[updateServerConf]', '未查询到id=' + updateServer.id + '相应的服务', ctx);
            ctx.makeErrResObj();
        }
    } catch (e) {
        logger.error('[updateServerConf]', e, ctx);
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
        logger.error('[loadServer]', e, ctx);
        ctx.makeErrResObj();
    }
};

ServerController.sendCommand = async(ctx) => {
    let params = ctx.paramsObj;
    try {
        let rst = await ServerService.getServerConfById(params.server_ids);
        if (!_.isEmpty(rst)) {
            rst = rst.dataValues;
            if (!await AuthService.hasDevAuth(rst.application, rst.server_name, ctx.uid)) {
                ctx.makeNotAuthResObj();
            } else {
                let list = [{
                    application : rst.application,
                    serverName : rst.server_name,
                    nodeName : rst.node_name
                }]
                let ret = await AdminService.doCommand(list, params.command);
                ctx.makeResObj(200, '', ret);
            }
        } else {
            logger.error('[sendCommand]:', '未查询到id=' + params.server_ids + '相应的服务', ctx);
            ctx.makeErrResObj();
        }
    } catch (e) {
        logger.error('[getRealtimeState]', e, ctx);
        ctx.makeErrResObj();
    }
}

ServerController.getServerNodes = async(ctx) => {
    let {application, server_name} = ctx.paramsObj;
    try{
        if (!await AuthService.hasDevAuth(application, server_name, ctx.uid)) {
            ctx.makeNotAuthResObj();
        } else {
            let ret = await ServerService.getServerConfList4Tree({application, serverName:server_name});
            ctx.makeResObj(200, '', ret);
        }
    }  catch (e) {
        logger.error('[getServerNodes]', e, ctx);
        ctx.makeErrResObj();
    }
}

module.exports = ServerController;