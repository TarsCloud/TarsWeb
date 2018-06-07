const ServerDao = require('../../dao/ServerDao');
const AdapterDao = require('../../dao/AdapterDao');
const logger = require('../../logger');
const ServerService = require('../server/ServerService');
const ConfigService = require('../config/ConfigService');
const AuthService = require('../auth/AuthService');
const _ = require('lodash');
const util = require('../../tools/util')

const ExpandService = {}

ExpandService.preview = async(params)=> {
    let application = params.application;
    let serverName = params.server_name;
    let sourceServer = await ServerDao.getServerConfByName(application, serverName, params.node_name);
    let sourceAdapter = await AdapterDao.getAdapterConf(application, serverName, params.node_name);
    let result = [];
    params.expand_nodes.forEach((expandNode)=> {
        sourceAdapter.forEach((adapter)=> {
            adapter = adapter.dataValues;
            let preServer = {
                application: application,
                server_name: serverName,
                node_name: expandNode,
                template_name: sourceServer.template_name,
                port: 0,
                auth: 0
            };
            if (params.enable_set) {
                preServer.set = [params.set_name, params.set_area, params.set_group].join('.');
            } else {
                preServer.set = '';
            }
            let servant = adapter.servant;
            preServer.obj_name = servant.substring(servant.lastIndexOf('.') + 1);
            preServer.bind_ip = expandNode;
            preServer.status = expandNode == sourceServer.node_name ? "#java.expand.node.status.existent#" : "java.expand.node.status.nonexistent";
            result.push(preServer);
        });
    });
    return result;
};

ExpandService.expand = async(params) => {
    let application = params.application;
    let serverName = params.server_name;
    let sourceServer = await ServerDao.getServerConfByName(application, serverName, params.node_name);
    let sourceAdapters = await AdapterDao.getAdapterConf(application, serverName, params.node_name) || [];
    sourceServer = sourceServer && sourceServer.dataValues || {};
    let addServers = [];
    for (var i = 0; i < params.expand_preview_servers.length; i++) {
        let preServer = params.expand_preview_servers[i];
        let serverConf = await ServerDao.getServerConfByName(application, serverName, preServer.node_name);
        if (!serverConf) {
            let server = {
                application: application,
                server_name: serverName,
                node_name: preServer.node_name
            };
            let enableSet = _.isEmpty(preServer.set);
            server.enable_set = enableSet ? 'Y' : 'N';
            if (enableSet) {
                server = _.extend(server, _.zipObject(['set_name', 'set_area', 'set_group'], preServer.set.split('.')));
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
            let rst = await ServerDao.insertServerConf(server);
            addServers.push(rst.dataValues);
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
                _.each(sourceAdapters, (adapter)=> {
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
            };
            let portType = sourceAdapter.endpoint.substring(0, sourceAdapter.endpoint.indexOf(' '));
            portType = _.indexOf(['tcp', 'udp'], portType) > -1 ? portType : 'tcp';
            adapter.endpoint = portType + ' -h ' + preServer.bind_ip + ' -t ' + sourceAdapter.queuetimeout + ' -p ' + preServer.port + ' -e ' + (preServer.auth ? preServer.auth : 0);
            await AdapterDao.insertAdapterConf(adapter);
        }
    }
    return addServers;
};

ExpandService.formatToArray = (list, key)=> {
    let rst = [];
    list.forEach((item) => {
        rst.push(item[key]);
    });
    return rst;
};

ExpandService.getApplication = async(uid) => {
    if (await AuthService.hasAdminAuth(uid)) {
        return ExpandService.formatToArray(await ServerDao.getApplication(), 'application');
    } else {
        let authList = await AuthService.getAuthListByUid(uid);
        let appList = [];
        authList.forEach((auth)=> {
            let application = auth.application;
            appList.push(application);
        });
        return _.uniq(appList);
    }
};

ExpandService.getServerName = async(application, uid) => {
    if (await AuthService.hasAdminAuth(uid)) {
        return ExpandService.formatToArray(await ServerDao.getServerName(application), 'server_name');
    } else {
        let authList = await AuthService.getAuthListByUid(uid);
        let serverList = [];
        for (var i = 0; i < authList.length; i++) {
            let auth = authList[i];
            let authApplication = auth.application;
            let authServerName = auth.serverName;
            if(authServerName){
                if(authApplication == application){
                    serverList.push(authServerName);
                }
            }else if(authApplication == application){
                let serverConfs = await ServerDao.getServerConf({
                    application: application
                });
                serverConfs.forEach((serverConf)=> {
                    serverConf = serverConf.dataValues;
                    serverList.push(serverConf.server_name);
                })
            }
        }
        return _.uniq(serverList);
    }
};

ExpandService.getSet = async(application, serverName) => {
    return ExpandService.formatToArray(await ServerDao.getSet(application, serverName), 'set');
};

ExpandService.getNodeName = async(application, serverName, set)=> {
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