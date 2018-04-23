/**
 * Created by clauseliu on 2018/4/18.
 */

const ConfigDao = require('../../dao/ConfigDao');
const logger = require('../../logger');

const ConfigService = {};


ConfigService.addConfigFile = async(params) => {
    const APP_LEVEL = 1;        // 应用配置，set配置
    const SERVER_LEVEL = 2;     // 服务配置

    let paramsObj = {};
    paramsObj.level = params.level ==5 ? SERVER_LEVEL : APP_LEVEL;

    paramsObj.server_name = paramsObj.level === APP_LEVEL ? params.application : `${params.application}.${params.server_name}`;

    Object.assign(paramsObj,{
        set_name : params.set_name || '',
        set_area : params.set_area || '',
        set_group : params.set_group || '',
        filename : params.filename,
        config : params.config.replace(/^\s|\s$/g,''),
        posttime : formatToStr(new Date(), 'yyyy-mm-dd hh:mm:ss')
    });

    let configFile = await ConfigDao.insertConfigFile(paramsObj);
    configFile = configFile.dataValues;
    let history = {
        configid    :   configFile.id,
        reason      :   'add config',
        content     :   configFile.config,
        posttime    :   configFile.posttime
    };

    ConfigDao.insertConfigFileHistory(history).catch(e => logger.error('[insertConfigFileHistory]:',e));

    // insert default node config
    if(paramsObj.level == 2) {
        addDefaultNodeConfigFile(configFile);
    }

    return Promise.resolve(configFile);
};

ConfigService.deleteConfigFile = async(id) => {
    let list = await ConfigDao.getConfigRefByRefId(id);
    if(list.length > 0) {
        return Promise.reject('#config.notDelete#');
    }
    let configFile = await ConfigDao.loadConfigFile(id);
    configFile = configFile[0].dataValues;
    if(configFile.level==2) {
        let nodeConfigFiles = await ConfigDao.getNodeConfigFile({
            server_name:configFile.server_name,
            set_name:configFile.set_name,
            set_area:configFile.set_name,
            set_group:configFile.set_group
        });
        nodeConfigFiles.filter(function (config) {
            return config.filename = configFile.filename;
        }).forEach(function (config) {
            ConfigDao.deleteConfigFile(config.id).catch(e => logger.error('[deleteConfigFile]:',e));
        });
    }
    await ConfigDao.deleteConfigFile(id).catch(e => {
        logger.error('[deleteConfigFile]:',e);
        return Promise.reject(e);
    });
    return Promise.resolve(id);
};

ConfigService.updateConfigFile = async(params) => {
    let configFile = await ConfigDao.loadConfigFile(params.id);
    configFile = configFile[0].dataValues;
    Object.assign(configFile,{
        config  :   params.config,
        reason  :   params.reason,
        posttime:   formatToStr(new Date(), 'yyyy-mm-dd hh:mm:ss')
    });
    await ConfigDao.updateConfigFile(configFile).catch(e => {
        return Promise.reject(e);
    });

    let history = {
        configid    :   configFile.id,
        reason      :   configFile.reason,
        content     :   configFile.config,
        posttime    :   configFile.posttime
    };

    ConfigDao.insertConfigFileHistory(history).catch(e => logger.error('[insertConfigFileHistory]:',e));

    return await ConfigDao.loadConfigFile(params.id);
};

ConfigService.loadConfigFile = async(id) => {
    return await ConfigDao.loadConfigFile(id);
};

ConfigService.getServerConfigFile = async(params) => {
    return await ConfigDao.getServerConfigFile(params);
};

ConfigService.getApplicationConfigFile = async(application) => {
    return await ConfigDao.getApplicationConfigFile(application);
};

ConfigService.getSetConfigFile = async(params)=> {
    return await ConfigDao.getSetConfigFile(params);
};

ConfigService.getNodeConfigFile = async(params) => {
    return await ConfigDao.getNodeConfigFile({
        server_name:`${params.application}.${params.server_name}`,
        set_name:params.set_name,
        set_area:params.set_name,
        set_group:params.set_group
    });
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

/**
 * 将Date对象变成字符串
 * @param {Object} date
 * @param {String} format
 * @return {String} date 返回经指定格式格式化后的时间字符串
 */
function formatToStr (date, format){
    if(!date || date=='Invalid Date') return;
    return format.replace(/yyyy/gi, date.getFullYear().toString())
        .replace(/MM/i, formatNum(date.getMonth() + 1))
        .replace(/dd/gi, formatNum(date.getDate()))
        .replace(/hh/gi, formatNum(date.getHours()))
        .replace(/mm/gi, formatNum(date.getMinutes()))
        .replace(/ss/gi, formatNum(date.getSeconds()));

    function formatNum(n){
        return (n < 10 ? '0' + n : n).toString();
    }
}

function addDefaultNodeConfigFile(params) {

    // 传了节点时
    const addConfigFileByNodeName = async function() {
        const configs = await ConfigDao.getServerConfigFile({server_name:params.server_name, set_name:params.set_name, set_area:params.set_area, set_group:params.set_group});
        for(let i = 0,len=configs.length;i<len;i++) {
            let config = configs[i];
            let newRow = Object.assign({},{
                id          :   config.id,
                posttime    :   formatToStr(new Date(), 'yyyy-mm-dd hh:mm:ss'),
                lastuser    :   config.lastuser,
                level       :   3,
                host        :   params.nodeName
            });
            const configFile = await ConfigDao.insertConfigFile(newRow);
            const history = {
                configid    :   configFile.id,
                reason      :   'add config',
                content     :   configFile.config,
                posttime    :   configFile.posttime
            };

            ConfigDao.insertConfigFileHistory(history).catch(e => logger.error('[insertConfigFileHistory]:',e));
        }
    };

    // 传了文件名时
    function addConfigFileByFileName() {

    }



    let keys = Array.from(Object.keys(params));
    if(keys.includes('nodeName')){
        addConfigFileByNodeName();
    }else{
        addConfigFileByFileName();
    }
}


module.exports = ConfigService;