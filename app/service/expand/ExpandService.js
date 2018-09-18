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

const ServerDao = require('../../dao/ServerDao');
const AdapterDao = require('../../dao/AdapterDao');
const ConfigDao = require('../../dao/ConfigDao');
const logger = require('../../logger');
const ServerService = require('../server/ServerService');
const AdapterService = require('../adapter/AdapterService');
const AuthService = require('../auth/AuthService');
const TaskService = require('../task/TaskService');
const _ = require('lodash');
const util = require('../../tools/util');
const Sequelize = require('sequelize');
const resourceConf = require('../../../config/resourceConf');
const ResourceService = require('../resource/ResourceService');

const ExpandService = {}

ExpandService.releaseNodeTfae = async (params) => {
    let {
        application,           // 应用
        server_name,           // 服务名
        node_name,             // 参考节点，没有默认就是0.0.0.0
        expand_nodes,          // 扩容节点
        copy_node_config,      // 是否复制节点服务配置
        patch_id               //上传包返回的 id
    } = params;
    // 预扩容节点信息
    let rst = await ExpandService.preview(params);
    // 获取节点端口
    let portRst = await AdapterService.getAvaliablePort(expand_nodes);
    // 节点附加端口
    rst.forEach(node => {
        portRst.forEach(nodePort => {
            if (node.node_name === nodePort.node_name) node.port = nodePort.port
        })
    });
    // 扩容参数
    let expandOption = {
        application,
        server_name,
        node_name,
        copy_node_config,
        expand_preview_servers: []
    };
    expandOption.expand_preview_servers = rst.map(node => {
        return {
            bind_ip: node.bind_ip,
            node_name: node.node_name,
            obj_name: node.obj_name,
            port: node.port,
            set: node.set,
        }
    });
    // 扩容
    let expandRst = await ExpandService.expand(expandOption);
    let {server_conf} = expandRst;
    if (server_conf.length === 0) throw new Error('节点都已存在，扩容失败');

    // 发布
    let task_no = util.getUUID().toString();
    let taskOption = {
        serial: true,
        items: [],
        task_no: task_no
    };
    taskOption.items = server_conf.map(server => {
        return {
            "server_id": server.id,
            "command": "patch_tars",
            "parameters": {
                "patch_id": patch_id,
                "bak_flag": false,
                "update_text": ""

            }
        }
    });
    await TaskService.addTask(taskOption);
    // ctx.makeResObj(200, '', task_no);
    return {task_no}
};

ExpandService.preview = async (params) => {
    let application = params.application;
    let serverName = params.server_name;
    let sourceServer = await ServerDao.getServerConfByName(application, serverName, params.node_name);
    let sourceAdapter = await AdapterDao.getAdapterConf(application, serverName, params.node_name);
    let result = [];
    params.expand_nodes.forEach((expandNode) => {
        sourceAdapter.forEach((adapter) => {
            adapter = adapter.dataValues;
            let preServer = {
                application: application,
                server_name: serverName,
                node_name: expandNode.ip,
                template_name: sourceServer.template_name,
                port: 0,
                auth: 0
            };
            if (expandNode.enable_set) {
                preServer.set = [expandNode.set_name, expandNode.set_area, expandNode.set_group].join('.');
            } else {
                preServer.set = '';
            }
            let servant = adapter.servant;
            preServer.obj_name = servant.substring(servant.lastIndexOf('.') + 1);
            preServer.bind_ip = expandNode.ip;
            preServer.status = expandNode.ip == sourceServer.node_name ? "#api.expand.node.status.existent#" : "#api.expand.node.status.nonexistent#";
            result.push(preServer);
        });
    });
    return result;
};

ExpandService.expand = async (params) => {
    let transaction = await ServerDao.sequelize.transaction(); //开启事务
    try {
        let application = params.application;
        let serverName = params.server_name;
        let sourceServer = await ServerDao.getServerConfByName(application, serverName, params.node_name);
        let sourceAdapters = await AdapterDao.getAdapterConf(application, serverName, params.node_name) || [];
        sourceServer = sourceServer && sourceServer.dataValues || {};
        let addServers = [];
        let addServersMap = {};
        let addNodeNameMap = {};
        for (var i = 0; i < params.expand_preview_servers.length; i++) {
            let preServer = params.expand_preview_servers[i];
            if (!addServersMap[`${application}-${serverName}-${preServer.node_name}`]) {
                let serverConf = await ServerDao.getServerConfByName(application, serverName, preServer.node_name);
                if (!serverConf) {
                    let server = {
                        application: application,
                        server_name: serverName,
                        node_name: preServer.node_name
                    };
                    let enableSet = !_.isEmpty(preServer.set);
                    server.enable_set = enableSet ? 'Y' : 'N';
                    if (enableSet) {
                        server = _.extend(server, _.zipObject(['set_name', 'set_area', 'set_group'], preServer.set.split('.')));
                    } else {
                        server = _.extend(server, _.zipObject(['set_name', 'set_area', 'set_group'], [null, null, null]));
                    }
                    server = _.extend(server, {
                        server_type: sourceServer.server_type,
                        template_name: sourceServer.template_name,
                        bak_flag: sourceServer.bak_flag,
                        base_path: sourceServer.base_path,
                        exe_path: sourceServer.exe_path,
                        start_script_path: sourceServer.start_script_path
                    });
                    server = util.leftAssign(ServerService.serverConfFields(), server);
                    let rst = await ServerDao.insertServerConf(server, transaction);
                    addServers.push(rst.dataValues);
                    addServersMap[`${server.application}-${server.server_name}-${server.node_name}`] = true;
                    addNodeNameMap[server.node_name] = true;
                    if (params.copy_node_config) {
                        let configParams = {
                            server_name: `${sourceServer.application}.${sourceServer.server_name}`
                        };
                        sourceServer.set_name && (configParams.set_name = sourceServer.set_name);
                        sourceServer.set_area && (configParams.set_area = sourceServer.set_area);
                        sourceServer.set_group && (configParams.set_group = sourceServer.set_group);
                        let configs = await ConfigDao.getNodeConfigFile(configParams);
                        configs = configs.filter((config) => {
                            config = config.dataValues;
                            return config.host == sourceServer.node_name
                        });
                        for (let i = 0; i < configs.length; i++) {
                            let config = configs[i].dataValues;
                            let newConfig = {
                                server_name: '',
                                set_name: '',
                                set_area: '',
                                set_group: '',
                                host: '',
                                filename: '',
                                config: '',
                                posttime: '',
                                level: 2,
                                configFlag: 0
                            };
                            newConfig = util.leftAssign(newConfig, config);
                            newConfig.posttime = new Date();
                            newConfig.host = server.node_name;
                            await ConfigDao.insertConfigFile(newConfig, transaction);
                        }
                    }
                }
            }

            let targetAdapter = await AdapterDao.getAdapterConfByObj({
                application: application,
                serverName: serverName,
                nodeName: preServer.node_name,
                objName: preServer.obj_name
            });
            if (!targetAdapter) {
                let sourceAdapter = ((application, serverName, nodeName, objName) => {
                    let sourceAdapter = {};
                    _.each(sourceAdapters, (adapter) => {
                        adapter = adapter.dataValues;
                        if (adapter.application == application && adapter.server_name == serverName && adapter.node_name == nodeName && adapter.servant.substring(adapter.servant.lastIndexOf('.') + 1) == objName) {
                            sourceAdapter = adapter;
                            return false;
                        }
                    });
                    return sourceAdapter;
                })(application, serverName, params.node_name, preServer.obj_name);
                if (_.isEmpty(sourceAdapter)) {
                    return;
                }
                let adapter = {
                    application: application,
                    server_name: serverName,
                    node_name: preServer.node_name,
                    servant: sourceAdapter.servant,
                    adapter_name: sourceAdapter.adapter_name,
                    thread_num: sourceAdapter.thread_num,
                    max_connections: sourceAdapter.max_connections,
                    queuecap: sourceAdapter.queuecap,
                    queuetimeout: sourceAdapter.queuetimeout,
                    allow_ip: sourceAdapter.allow_ip,
                    protocol: sourceAdapter.protocol,
                    handlegroup: sourceAdapter.handlegroup,
                    posttime: new Date('1970-01-01 00:00:00')
                };
                let portType = sourceAdapter.endpoint.substring(0, sourceAdapter.endpoint.indexOf(' '));
                portType = _.indexOf(['tcp', 'udp'], portType) > -1 ? portType : 'tcp';
                adapter.endpoint = portType + ' -h ' + preServer.bind_ip + ' -t ' + sourceAdapter.queuetimeout + ' -p ' + preServer.port + ' -e ' + (preServer.auth ? preServer.auth : 0);
                await AdapterDao.insertAdapterConf(adapter, transaction);
            }
        }
        await transaction.commit();

        let rst = {server_conf: addServers, tars_node_rst: []};
        let addNodeName = _.keys(addNodeNameMap);
        if (resourceConf.enableAutoInstall && addNodeName && addNodeName.length) {
            rst.tars_node_rst = await ResourceService.installTarsNodes(addNodeName);
        }
        return rst;
    } catch (e) {
        await transaction.rollback();
        throw e;
    }
};

ExpandService.formatToArray = (list, key) => {
    let rst = [];
    list.forEach((item) => {
        rst.push(item[key]);
    });
    return rst;
};

ExpandService.getApplication = async (uid) => {
    if (await AuthService.hasAdminAuth(uid)) {
        return ExpandService.formatToArray(await ServerDao.getApplication(), 'application');
    } else {
        let authList = await AuthService.getAuthListByUid(uid);
        let appList = [];
        authList.forEach((auth) => {
            let application = auth.application;
            appList.push(application);
        });
        return _.uniq(appList);
    }
};

ExpandService.getServerName = async (application, uid) => {
    if (await AuthService.hasAdminAuth(uid)) {
        return ExpandService.formatToArray(await ServerDao.getServerName(application), 'server_name');
    } else {
        let authList = await AuthService.getAuthListByUid(uid);
        let serverList = [];
        for (var i = 0; i < authList.length; i++) {
            let auth = authList[i];
            let authApplication = auth.application;
            let authServerName = auth.serverName;
            if (authServerName) {
                if (authApplication == application) {
                    serverList.push(authServerName);
                }
            } else if (authApplication == application) {
                let serverConfs = await ServerDao.getServerConf({
                    application: application
                });
                serverConfs.forEach((serverConf) => {
                    serverConf = serverConf.dataValues;
                    serverList.push(serverConf.server_name);
                })
            }
        }
        return _.uniq(serverList);
    }
};

ExpandService.getSet = async (application, serverName) => {
    return ExpandService.formatToArray(await ServerDao.getSet(application, serverName), 'set');
};

ExpandService.getNodeName = async (application, serverName, set) => {
    let params = {
        application: application,
        serverName: serverName
    };
    if (!_.isEmpty(set)) {
        params.enableSet = true;
        let setObj = set.split('.');
        params.setName = setObj[0] || '';
        params.setArea = setObj[1] || '';
        params.setGroup = setObj[2] || ''
    } else {
        params.enableSet = false;
    }
    return ExpandService.formatToArray(await ServerDao.getNodeName(params), 'node_name');
};

module.exports = ExpandService;