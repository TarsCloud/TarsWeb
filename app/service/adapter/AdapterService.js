const ServerService = require('../server/ServerService');
const AdapterDao = require('../../dao/AdapterDao');
const logger = require('../../logger');

const AdapterService = {}

AdapterService.adpaterConfFields = () => {
    return {
        application: '',
        server_name: '',
        node_name: '',
        adapter_name: '',
        registry_timestamp: '',
        thread_num: 1,
        endpoint: '',
        max_connections: 1000,
        allow_ip: '',
        servant: '',
        queuecap: '',
        queuetimeout: '',
        posttime: "0000:00:00 00:00:00",
        lastuser: '',
        protocol: "tars",
        handlegroup: ''
    };
};

//通过ID获取adapter信息
AdapterService.getAdapterConfById = async(id) => {
    return await AdapterDao.getAdapterConfById(id);
};

//通过服务ID获取adapter信息
AdapterService.getAdapterConfList = async(serverConfId) => {
    let adapter = await ServerService.getServerConfById(serverConfId);
    if (adapter.length && adapter[0] && adapter[0].dataValues) {
        adapter = adapter[0].dataValues;
        return await AdapterDao.getAdapterConf(adapter.application, adapter.server_name, adapter.node_name);
    } else {
        return [];
    }
};

// 新增adapter
AdapterService.addAdapterConf = async(params) => {
    return await AdapterDao.insertAdapterConf(params);
};

//删除adapter
AdapterService.deleteAdapterConf = async(id) =>{
    return await AdapterDao.deleteAdapterConf(id);
};

// 更新adapter
AdapterService.updateAdapterConf = async(params) => {
    return await AdapterDao.updateAdapterConf(params);
};




module.exports = AdapterService;