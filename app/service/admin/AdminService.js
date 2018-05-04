const {configFPrx, configFStruct, adminRegPrx, adminRegStruct} = require('../util/rpcClient');
const logger = require('../../logger');
const tarsStream = require('@tars/stream');

const AdminService = {};

AdminService.loadServer = async (application, server, nodeName) => {
    let ret = await adminRegPrx.loadServer(application, server, nodeName);
    if(ret.__return === 0){
        return ret.result;
    }else{
        throw new Error(__return);
    }
};

module.exports = AdminService;