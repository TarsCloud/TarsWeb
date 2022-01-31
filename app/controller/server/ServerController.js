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

const logger = require('../../../logger');
const ServerService = require('../../service/server/ServerService');
const ExpandService = require('../../service/expand/ExpandService');
const AdminService = require('../../service/admin/AdminService');
const NodeInfoDao = require('../../dao/NodeInfoDao');
const ServerDao = require('../../dao/ServerDao');
const _ = require('lodash');
const util = require('../../../tools/util');
const AuthService = require('../../service/auth/AuthService');
const {
    async
} = require('q');
const webConf = require('../../../config/webConf').webConf;
const {
    flatMap
} = require('lodash');

const serverConfStruct = {
    id: '',
    application: '',
    server_name: '',
    node_name: '',
    server_type: '',
    enable_set: {
        formatter: (value) => {
            return value == 'Y' ? true : false;
        }
    },
    set_name: '',
    set_area: '',
    set_group: '',
    setting_state: '',
    present_state: '',
    bak_flag: {
        formatter: (value) => {
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
    patch_time: {
        formatter: util.formatTimeStamp
    },
    patch_version: "",
    patch_user: '',
    process_id: '',
    posttime: {
        formatter: util.formatTimeStamp
    },
    enable_group: {
        formatter: (value) => {
            return value == 'Y' ? true : false;
        }
    },
    ip_group_name: {
        formatter: (value) => {
            return value == null ? "" : value;
        }
    },
    flow_state: 'active',
    label: {}
};

const ServerController = {};


ServerController.getServerConfById = async (ctx) => {
    let id = ctx.paramsObj.id;
    try {
        var rst = await ServerService.getServerConfById(id);
        if (!_.isEmpty(rst)) {
            rst = rst.dataValues;
            if (!await AuthService.hasOpeAuth(rst.application, rst.server_name, ctx.uid)) {
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

ServerController.serverExist = async (ctx) => {
    let application = ctx.paramsObj.application;
    let serverName = ctx.paramsObj.server_name;
    let nodeNames = ctx.paramsObj.node_names;
    try {
        let data = await ServerService.getServerConf(application, serverName, '');

        let exists = false;
        data.some(d => {
            if (nodeNames.indexOf(d.node_name) != -1) {
                exists = true;
                return true;
            }
            return false;
        })
        ctx.makeResObj(200, '', exists);
    } catch (e) {
        logger.error('[serverExist]', e, ctx);
        ctx.makeErrResObj();
    }
};

ServerController.getApplicationList = async (ctx) => {
    try {
        let application = [];
        let data = await ServerService.getApplicationList();

        data.forEach((x, y) => {
            // application.push(x.application);
            application.push(x.f_name);
        });

        ctx.makeResObj(200, '', application);
    } catch (e) {
        logger.error('[getApplicationList]', e, ctx);
        ctx.makeErrResObj();
    }
}

ServerController.getNodeList = async (ctx) => {
    try {
        let nodes = [];
        let data = await ServerService.getNodeList();

        data.forEach((x, y) => {
            nodes.push(x.node_name);
        });

        ctx.makeResObj(200, '', nodes);
    } catch (e) {
        logger.error('[getNodeList]', e, ctx);
        ctx.makeErrResObj();
    }
}

ServerController.getServerConfList4Tree = async (ctx) => {
    let treeNodeId = ctx.paramsObj.tree_node_id;
    let curPage = parseInt(ctx.paramsObj.cur_page) || 0;
    let pageSize = parseInt(ctx.paramsObj.page_size) || 0;
    let isPage = ctx.paramsObj.is_page == undefined ? false : ctx.paramsObj.is_page;
    //   logger.info(treeNodeId + "," + curPage + "," + pageSize + "," + isPage);
    try {
        let params = ServerController.formatTreeNodeId(treeNodeId);
        if (await AuthService.hasAdminAuth(ctx.uid)) {
            let ret = await ServerService.getServerConfList4Tree({
                application: params.application,
                serverName: params.serverName,
                enableSet: params.enableSet,
                setName: params.setName,
                setArea: params.setArea,
                setGroup: params.setGroup,
                curPage: curPage || 0,
                pageSize: pageSize || 0,
                isPage: isPage
            })
            if (isPage == "true") {
                ret.rows = util.viewFilter(ret.rows, serverConfStruct);
            } else {
                ret = util.viewFilter(ret, serverConfStruct);
            }
            ctx.makeResObj(200, '', ret);
        } else if (params.application && params.serverName) { //若在服务页面，则直接检测是否有权限

            if (!await AuthService.hasOpeAuth(params.application, params.serverName, ctx.uid)) {
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
        } else { //若非服务页面，比如应用页面，set页面，需先获取用户相关权限进行合并

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
            _.each(authList, (auth) => {
                let application = auth.application;
                let serverName = auth.serverName;
                if (!serverName && application == params.application) {
                    rst = serverList;
                    return false;
                }
                serverList.forEach((server) => {
                    if (server.application == application && server.server_name == serverName) {
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
    treeNodeId.forEach((s) => {
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

    if (serverConf.setName || serverConf.setArea || typeof serverConf.setGroup != "undefined") {
        serverConf.enableSet = 'Y';
    }
    // 无set信息，且有app和servername信息时，说明是查询无set服务节点。此时要将enableSet设置为N，否则会把带set节点也查出来
    // 不能直接非Y就设置为N，否则根据application查询下面所有节点时，会查不到任何数据
    if (serverConf.enableSet != 'Y' && serverConf.application && serverConf.serverName) {
        serverConf.enableSet = 'N'
    }

    return serverConf;
};

ServerController.getInactiveServerConfList = async (ctx) => {
    let application = ctx.paramsObj.application || '';
    let serverName = ctx.paramsObj.server_name || '';
    let nodeName = ctx.paramsObj.node_name || '';
    let curPage = parseInt(ctx.paramsObj.cur_page) || 0;
    let pageSize = parseInt(ctx.paramsObj.page_size) || 0;
    try {
        if (!await AuthService.hasOpeAuth(application, serverName, ctx.uid)) {
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

ServerController.getRealtimeState = async (ctx) => {
    let id = ctx.paramsObj.id;
    try {
        let rst = await ServerService.getServerConfById(id);
        if (!_.isEmpty(rst)) {
            rst = rst.dataValues;
            if (!await AuthService.hasOpeAuth(rst.application, rst.server_name, ctx.uid)) {
                ctx.makeNotAuthResObj();
            } else {
                ctx.makeResObj(200, '', {
                    realtime_state: rst['present_state']
                });
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

ServerController.updateServerConf = async (ctx) => {
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
            server.ip_group_name = server.enable_group ? server.ip_group_name : "";
            server.enable_group = server.enable_group ? 'Y' : 'N';
            if (server.enable_set == 'Y' && parseInt(server.set_group) != server.set_group) {
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

ServerController.batchUpdateServerConf = async (ctx) => {
    let updateServer = ctx.paramsObj;
    let ids = updateServer.id;
    let server = await ServerService.getServerConfByIds(ids);
    if (!(updateServer.id == null || ids.length != server.length)) {
        for (let i = 0; i < server.length; i++) {
            if (!await AuthService.hasDevAuth(server[i].application, server[i].server_name, ctx.uid)) {
                ctx.makeNotAuthResObj();
                continue;
            }
            let ser = server[i];
            Object.assign(server[i], updateServer);
            updateServer.bak_flag != undefined && (server[i].bak_flag = server[i].isBak ? 1 : 0);
            updateServer.enable_set != undefined && (server[i].enable_set = server[i].enable_set ? 'Y' : 'N');
            updateServer.ip_group_name != undefined && (server[i].ip_group_name = server[i].ip_group_name ? 'Y' : 'N');
            updateServer.enable_group != undefined && (server[i].enable_group = server[i].enable_group ? 'Y' : 'N');
            if (server[i].enable_set == 'Y' && parseInt(server[i].set_group) != server[i].set_group) {
                ctx.makeResObj(500, '#batchUpdateServerConf assign fail#');
                return;
            }
            server[i].posttime = new Date();
        } //只要有一个有权限有问题就全部不做更新
        for (let i = 0; i < server.length; i++) {
            await ServerService.updateServerConf(server[i]);
        }
        ctx.makeResObj(200, '', util.viewFilter(await ServerService.getServerConfByIds(ids), serverConfStruct));
    } else {
        logger.error('[BatchUpdateServerConf]', '未查询到或修改个数与库存在个数不一致', ctx);
        ctx.makeErrResObj();
    }
};

ServerController.getServerSearch = async (ctx) => {
    let {
        searchkey
    } = ctx.paramsObj
    try {
        let currPage = parseInt(ctx.paramsObj.curr_page) || 0
        let pageSize = parseInt(ctx.paramsObj.page_size) || 0
        let ret = await ServerDao.getServerConfBySearchKey(searchkey.trim(), currPage, pageSize)
        let rows = util.viewFilter(ret.rows, serverConfStruct) || []

        rows.forEach(server => {
            let id;
            if (server.enable_set == 'Y') {
                id = '1' + server.application + '.' + '2' + server.set_name + '.' + '3' + server.set_area + '.' + '4' + server.set_group + '.' + '5' + server.server_name;
            } else {
                id = '1' + server.application + '.' + '5' + server.server_name;
            }
            server.id = id
        })
        ctx.makeResObj(200, '', {
            count: ret.count,
            rows,
        })
    } catch (e) {
        logger.error('[getServerSearch]', e, ctx);
        ctx.makeErrResObj();
    }
}

ServerController.loadServer = async (ctx) => {
    let application = ctx.paramsObj.application;
    let serverName = ctx.paramsObj.server_name;
    let nodeName = ctx.paramsObj.node_name;
    try {
        if (!await AuthService.hasOpeAuth(application, serverName, ctx.uid)) {
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

ServerController.sendCommand = async (ctx) => {
    let params = ctx.paramsObj;
    try {
        let rst = await ServerService.getServerConfByIds(params.server_ids.split(","));
        //既然是处理list,上版本就不应该只取一个
        if (!_.isEmpty(rst)) {
            let hasDevAuth = true
            for (let item in rst) {
                hasDevAuth = await AuthService.hasDevAuth(rst[item].application, rst[item].server_name, ctx.uid);
            }
            if (!hasDevAuth) {
                ctx.makeNotAuthResObj();
            } else {
                let list = rst.map(item => {
                    return {
                        application: item.application,
                        serverName: item.server_name,
                        nodeName: item.node_name
                    }
                })
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

ServerController.getServerNodes = async (ctx) => {
    let {
        application,
        server_name
    } = ctx.paramsObj;
    try {
        if (!await AuthService.hasOpeAuth(application, server_name, ctx.uid)) {
            ctx.makeNotAuthResObj();
        } else {
            let ret = await ServerService.getServerConfList4Tree({
                application,
                serverName: server_name
            });
            ctx.makeResObj(200, '', ret);
        }
    } catch (e) {
        logger.error('[getServerNodes]', e, ctx);
        ctx.makeErrResObj();
    }
}

ServerController.needDeployLog = async (ctx) => {
    try {

        let need = true;

        if (!webConf.strict) {
            need = false;
        } else {
            //严格模式下, tarslog和主控部署在同一台机器上, 则要求重新部署
            let log = await ServerDao.getServerConfList('tars', 'tarslog');
            if (log) {
                let node_names = log.map(x => {
                    return x.node_name
                });

                need = await ServerService.isDeployWithRegistry(node_names);
            }
        }
        ctx.makeResObj(200, '', {
            need: need
        });
    } catch (e) {
        logger.error('[needDeployLog]', e, ctx);
        ctx.makeErrResObj();
    }
}

ServerController.expandDeployLog = async (ctx) => {
    let node_name = ctx.paramsObj.node_name;

    try {
        //检查节点是否存在
        let has = await NodeInfoDao.hasNodeNode(node_name);

        if (!has) {
            ctx.makeResObj(500, '#deployLog.installNode#');
            return;
        }

        //检查节点和主控是否部署在一起
        let same = await ServerService.isDeployWithRegistry([node_name]);
        if (same) {
            ctx.makeResObj(500, '#deployLog.sameWithRegistry#');
            return;
        }

        var params = {
            application: "tars",
            copy_node_config: true,
            expand_preview_servers: [{
                bind_ip: node_name,
                node_name: node_name,
                obj_name: "LogObj",
                port: 0,
                set: ""
            }],
            node_name: await ServerService.getLogNodeNameWithRegistry(),
            server_name: "tarslog",
            set: ''
        }

        await ExpandService.expand(params);

        //remove和框架上部署在一起的tarslog
        await ServerService.undeployTarsLog(ctx.uid);

        let rst = await ServerService.getServerConf('tars', 'tarslog', node_name);

        ctx.makeResObj(200, '', {
            server: rst
        });
    } catch (e) {
        logger.error('[expandDeployLog]', e, ctx);
        ctx.makeErrResObj();
    }
}

ServerController.getFrameworkList = async (ctx) => {
    try {
        if (!await AuthService.hasAdminAuth(ctx.uid)) {
            ctx.makeNotAuthResObj();
        } else {
            let ret = await AdminService.getFrameworkList();
            // console.log('getFrameworkList:', ret);
            ctx.makeResObj(200, '', {
                servers: ret
            });
        }
    } catch (e) {
        logger.error('[getFrameworkList]', e, ctx);
        ctx.makeErrResObj();
    }
}

ServerController.checkFrameworkServer = async (ctx) => {
    try {
        if (!await AuthService.hasAdminAuth(ctx.uid)) {
            ctx.makeNotAuthResObj();
        } else {
            let ret = await AdminService.checkServer(ctx.paramsObj.server);
            ctx.makeResObj(200, '', ret);
        }
    } catch (e) {
        logger.error('[checkFrameworkServer]', e, ctx);
        ctx.makeErrResObj();
    }

}

ServerController.updateFlowStatus = async (ctx) => {
    try {
        let params = ctx.paramsObj;
        let server = await ServerService.getServerConfById(params.server_id);
        if (!_.isEmpty(server)) {
            if (!await AuthService.hasDevAuth(server.application, server.server_name, ctx.uid)) {
                ctx.makeNotAuthResObj();
                return;
            }

            let ret = await AdminService.updateFlowStatus(server.application, server.server_name, params.status, params.node_list);
            ctx.makeResObj(200, '', ret);

        } else {
            logger.error('[updateServerConf]', '未查询到id=' + params.server_id + '相应的服务', ctx);
            ctx.makeErrResObj();
        }
    } catch (e) {
        logger.error('[updateServerConf]', e, ctx);
        ctx.makeErrResObj();
    }
}

ServerController.getServerState = async (ctx) => {
    try {
        let {
            queryState
        } = ctx.paramsObj;
        //相同的node只pingnode一次减少时间
        let nodeList = Array.from(new Set(queryState.map((item) => {
            return item.node_name
        })));
        let nodeState = new Map();
        for (let node of nodeList) {
            try {
                nodeState.set(node, await AdminService.pingNodeBool(node));
            } catch (e) {
                nodeState.set(node, false);
            }
        }
        for (let item of queryState) {
            try { //1.ping node  现无taf_dns
                if (nodeState.get(item.node_name)) {
                    item.is_node_ok = true
                    //2.取服务状态
                    let stateRet = await AdminService.getServerState(item.application, item.server_name, item.node_name);
                    item.setting_state_in_reg = stateRet.state.settingStateInReg.charAt(0).toUpperCase() + stateRet.state.settingStateInReg.slice(1);
                    item.present_state_in_node = stateRet.state.presentStateInNode.charAt(0).toUpperCase() + stateRet.state.presentStateInNode.slice(1);
                    item.present_state_in_reg = stateRet.state.presentStateInReg.charAt(0).toUpperCase() + stateRet.state.presentStateInReg.slice(1);
                    item.query_ret_code = stateRet.__return;
                } else {
                    item.is_node_ok = false;
                    item.query_ret_code = -1;
                }
            } catch (e) {
                item.is_node_ok = false;
                item.query_ret_code = -1;
            }
        }
        ctx.makeResObj(200, '', queryState);
    } catch (e) {
        logger.error('[getServerState]', e, ctx);
        ctx.makeErrResObj();
    }
}

ServerController.getAlarmConf = async (ctx) => {
    ctx.makeResObj(200, '', webConf.alarmUrl || "");
};

module.exports = ServerController;