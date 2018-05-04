const {configFPrx, configFStruct, adminRegPrx, adminRegStruct} = require('../util/rpcClient');
const logger = require('../../logger');
const tarsStream = require('@tars/stream');

const AdminService = {};

AdminService.loadServer = async (application, server, nodeName) => {
    console.log(application);
    let ret = await adminRegPrx.loadServer(application, server, nodeName);
    if(ret.__return === 0){
        return ret.result;
    }else{
        throw new Error(__return);
    }
};

AdminService.loadConfigByHost = async (server, filename, host) => {
    let ret = await configFPrx.loadConfigByHost(server, filename, host);
    if(ret.__return === 0) {
        return ret.result;
    }else{
        throw new Error(ret.__return);
    }
};

AdminService.doCommand = async (targets, command) => {
    let rets = [];
    for(var i=0,len=targets.length;i<len;i++) {
        let target = targets[i];
        let ret = {};
        try {
            ret = await adminRegPrx.notifyServer(target.application, target.serverName, target.nodeName, command);
        }catch(e) {
            ret = {
                __return : -1,
                result : e
            }
        }

        rets.push({
            application : target.application,
            server_name : target.serverName,
            node_name : target.nodeName,
            ret_code : ret.__return,
            err_msg : ret.result
        });
    }
    return rets;
};

module.exports = AdminService;