const {configFPrx, configFStruct, adminRegPrx, adminRegStruct} = require('../util/rpcClient');
const logger = require('../../logger');
const TarsStream = require('@tars/stream');

const AdminService = {};

AdminService.loadServer = async (application, server, nodeName) => {
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

AdminService.getTaskRsp = async (taskNo) => {
    let ret = await adminRegPrx.getTaskRsp(taskNo);
    if(ret.__return == 0 ){
        return ret.result;
    }else {
        return ret.__return;
    }
};

AdminService.addTask = async (req) => {
    let taskReq = new adminRegStruct.TaskReq();
    taskReq.readFromObject(req);
    let ret = await adminRegPrx.addTaskReq(taskReq);
    if(ret.__return == 0 ){
        return ret.result;
    }else {
        return ret.__return;
    }

};

module.exports = AdminService;