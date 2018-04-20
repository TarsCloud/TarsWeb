/**
 * Created by clauseliu on 2018/4/18.
 */

const logger = require(`../../logger`);
const ConfigMapper = require('../../dao/tConfigFiles');

const ConfigService = {};


ConfigService.addConfigFile = async(params) => {

    return {
        id              :   0,
        server_name     :   '',
        node_name       :   '',
        set_name        :   '',
        set_area        :   '',
        set_group       :   '',
        filename        :   '',
        config          :   '',
        level           :   1,
        posttime        :   ''
    }
};

ConfigService.deleteConfigFile = async(id) => {
    try{
        return Promise.resolve([id]);
    }catch(e){
        return Promise.reject(e);
    }
};

ConfigService.updateConfigFile = async(params) => {

    return {
        id              :   0,
        server_name     :   '',
        node_name       :   '',
        set_name        :   '',
        set_area        :   '',
        set_group       :   '',
        filename        :   '',
        config          :   '',
        level           :   1,
        posttime        :   ''
    }
};

ConfigService.loadConfigFile = async(id) => {
    return {
        id              :   0,
        server_name     :   '',
        node_name       :   '',
        set_name        :   '',
        set_area        :   '',
        set_group       :   '',
        filename        :   '',
        config          :   '',
        level           :   1,
        posttime        :   ''
    }
};

ConfigService.getServerConfigFile = function(params) {
    return ConfigMapper.getServerConfigFile(params).catch(function (e) {
        return e;
    });
};

ConfigService.getApplicationConfigFile = async(application) => {
    return await ConfigMapper.getApplicationConfigFile(application).catch(function (e) {
        return e;
    });
};

ConfigService.getSetConfigFile = function(params) {
    return ConfigMapper.getSetConfigFile(params).catch(function (e) {
        return e;
    });
};

ConfigService.getNodeConfigFile = async(params) => {
    let list = [{
        id              :   0,
        server_name     :   '',
        node_name       :   '',
        set_name        :   '',
        set_area        :   '',
        set_group       :   '',
        filename        :   '',
        config          :   '',
        level           :   1,
        posttime        :   ''
    }];
    return list
};

ConfigService.loadConfigFileHistory = async(id) => {
    return {
        "id": "",        // 变更记录ID
        "config_id": "", // 配置文件ID
        "reason": "",    // 备注
        "content": "",   // 变更内容
        "posttime": "",  // 更新时间
    }
};

ConfigService.getConfigFileHistory = async(config_id) => {
    return [{
        "id": "",        // 变更记录ID
        "config_id": "", // 配置文件ID
        "reason": "",    // 备注
        "content": "",   // 变更内容
        "posttime": "",  // 更新时间
    }]
};

/**
 * 添加引用文件
 * @param config_id
 * @param reference_id
 * @return {{id: string, config_id: string, reference_id: string}}
 */
ConfigService.addConfigRef = async(config_id, reference_id) => {
    return {
        "id": "",           // 引用ID
        "config_id": "",    // 配置文件ID
        "reference_id": ""  // 引用配置文件ID
    }
};

ConfigService.deleteConfigRef = async(id) => {
    return [0];
};

/**
 * 引用列表
 * @param config_id
 * @return {*[]}
 */
ConfigService.getConfigRefByConfigId = async(config_id) => {
    return [{
        "id": 0,                // 引用ID
        "config_id": 0,         // 配置文件ID
        "reference": {
            "id": 0,            // 配置文件ID
            "server_name": "",  // 服务
            "node_name": "",    // 节点
            "set_name": "",     // Set名
            "set_area": "",     // Set取
            "set_group": "",    // Set组
            "filename": "",     // 文件名
            "config": "",       // 文件内容
            "level": 1,         // 层级，1：应用或Set，2：服务，3：节点
            "posttime": "",     // 更新时间
        }
    }]
};




module.exports = ConfigService;