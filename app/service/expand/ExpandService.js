const ServerDao = require('../../dao/ServerDao');
const AdapterDao = require('../../dao/AdapterDao');
const logger = require('../../logger');
const ServerService = require('../server/ServerService');
const ConfigService = require('../config/ConfigService');
const _ = require('lodash');

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
            preServer.status = expandNode == sourceServer.node_name ? "已存在" : "未扩容";
            result.push(preServer);
        });
    });
    return result;
};

ExpandService.expand = async(params) => {
    let application = params.application;
    let serverName = params.server_name;
    let sourceServer = await ServerDao.getServerConfByName(application, serverName, params.node_name);
    let sourceAdapter = await AdapterDao.getAdapterConf(application, serverName, params.node_name);
    sourceServer = sourceServer && sourceServer.dataValues || {};
    params.expand_preview_servers.forEach(async(preServer)=> {
        let serverConf = await ServerService.getServerConf(application, serverName, preServer.node_nmame || '');
        if (!serverConf || !serverConf.dataValues || !serverConf.dataValues.length) {
            let server = {
                application: application,
                server_name: serverName,
                node_name: preServer.node_name
            };
            let enableSet = _.isEmpty(preServer.set);
            server.enable_set = enableSet ? 'Y' : 'N';
            if(enableSet){
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
            
        }
    })

};

module.exports = ExpandService;