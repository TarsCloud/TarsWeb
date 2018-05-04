/**
 * Created by clauseliu on 2018/4/18.
 */

const ConfigDao = require('../../dao/ConfigDao');
const ServerDao = require('../../dao/ServerDao');
const logger = require('../../logger');

const ConfigService = {};

ConfigService.getUnusedApplicationConfigFile = async(application, configId) => {
    return await ConfigDao.getUnusedApplicationConfigFile(application, configId);
};

/**
 * 新增配置文件
 * @param params
 * # level 服务层级
 * # application
 * # server_name
 * # set_name
 * # set_area
 * # set_group
 * # filename  文件名
 * # config    配置内容
 * @return {Promise.<*>}
 */
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

/**
 * 删除配置文件
 * @param id
 * @return {Promise.<*>}
 */
ConfigService.deleteConfigFile = async(id) => {
    let list = await ConfigDao.getConfigRefList(id);
    if(list.length > 0) {
        return Promise.reject('#config.notDelete#');
    }
    let configFile = await ConfigDao.getConfigFile(id);
    if(configFile.level==2) {
        let nodeConfigFiles = await ConfigDao.getNodeConfigFile({
            server_name:configFile.server_name,
            set_name:configFile.set_name,
            set_area:configFile.set_name,
            set_group:configFile.set_group
        });
        nodeConfigFiles.filter(config => {
            return config.filename = configFile.filename;
        }).forEach(config => {
            ConfigDao.deleteConfigFile(config.id).catch(e => logger.error('[deleteConfigFile]:',e));
        });
    }
    await ConfigDao.deleteConfigFile(id).catch(e => {
        logger.error('[deleteConfigFile]:',e);
        return Promise.reject(e);
    });
    return Promise.resolve(id);
};

/**
 * 更新配置文件
 * @param params
 * # id
 * # config
 * # reason
 * @return {*}
 */
ConfigService.updateConfigFile = async(params) => {
    let configFile = await ConfigDao.getConfigFile(params.id);
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

    return await ConfigDao.getConfigFile(params.id);
};

/**
 * 获取配置文件
 * @param id
 * @return {*}
 */
ConfigService.getConfigFile = async(id) => {
    return await ConfigDao.getConfigFile(id);
};


ConfigService.getConfigFileList = async(ids) => {
    return await ConfigDao.getConfigFileList(ids);
};

/**
 * 获取服务配置
 * # application
 * # server_name
 * # set_name
 * # set_area
 * # set_group
 * @return {*}
 */
ConfigService.getServerConfigFile = async(params) => {
    return await ConfigDao.getServerConfigFile(params);
};

/**
 * 获取应用配置
 * @param application
 * @return {*}
 */
ConfigService.getApplicationConfigFile = async(application) => {
    return await ConfigDao.getApplicationConfigFile(application);
};

/**
 * 获取SET配置
 * @param params
 * # application
 * # set_name
 * # set_area
 * # set_group
 * @return {*}
 */
ConfigService.getSetConfigFile = async(params)=> {
    return await ConfigDao.getSetConfigFile(params);
};

/**
 * 获取节点配置
 * @param params
 * # application
 * # server_name
 * # set_name
 * # set_area
 * # set_group
 * # configId
 * @return {*}
 */
ConfigService.getNodeConfigFile = async(params) => {
    const enableSet = params.set_name && params.set_area && params.set_group;
    const configFile = await ConfigDao.getConfigFile(params.config_id);
    const nodeConfigFile = await ConfigDao.getNodeConfigFile({
        server_name:`${params.application}.${params.server_name}`,
        set_name:params.set_name,
        set_area:params.set_area,
        set_group:params.set_group
    });
    let servers = await ServerDao.getServerConf({
        params:params.application,
        serverName:params.server_name,
        enableSet:enableSet,
        setName:params.set_name,
        setArea:params.set_area,
        setGroup:params.set_group
    });
    let list = [];
    nodeConfigFile.filter( config => {
        return config.filename = configFile.filename;
    }).forEach(config => {
        list.push(`${config.server_name}.${config.set_name || ''}.${config.set_area || ''}.${config.set_group || ''}_${config.host}`);
    });
    servers = servers.filter(server => {
        let key = `${params.application}.${params.server_name}.${params.set_name || ''}.${params.set_area || ''}.${params.set_group || ''}_${server.node_name}`;
        return !list.includes(key);
    });
    for(let i=0,len=servers.length;i<len;i++) {
        let server = servers[i];
        let newRow = {
            server_name     :   `${params.application}.${params.server_name}`,
            set_name        :   params.set_name,
            set_area        :   params.set_area,
            set_group       :   params.set_group,
            filename        :   configFile.filename,
            host            :   server.node_name,
            config          :   '',
            level           :   3,
            posttime        :   formatToStr(new Date(), 'yyyy-mm-dd hh:mm:ss')
        };
        let config = await ConfigDao.insertConfigFile(newRow).catch(e => logger.error('[insertConfigFile]:',e));
        config = config.get({'plain': true});
        let history = {
            configid    :   config.id,
            reason      :   'add config',
            content     :   config.config,
            posttime    :   config.posttime
        };
        await ConfigDao.insertConfigFileHistory(history).catch(e => logger.error('[insertConfigFileHistory]:',e));
    }
    return await nodeConfigFile;
};

/**
 * 获取配置文件修改记录
 * @param id
 * @return {*}
 */
ConfigService.getConfigFileHistory = async(id) => {
    return  await ConfigDao.getConfigFileHistory(id);
};

/**
 * 获取配置文件修改记录列表
 * @param config_id
 * @param curPage
 * @param pageSize
 * @return {*}
 */
ConfigService.getConfigFileHistoryList = async(config_id, curPage, pageSize) => {
    return await ConfigDao.getConfigFileHistoryList(config_id, curPage, pageSize);
};

/**
 * 添加引用文件
 * @param config_id
 * @param reference_id
 * @return {{id: string, config_id: string, reference_id: string}}
 */
ConfigService.addConfigRef = async(config_id, reference_id) => {
    return await ConfigDao.insertConfigRef(config_id,reference_id);
};

/**
 * 删除引用文件
 * @param reference_id
 * @return {reference_id}
 */
ConfigService.deleteConfigRef = async(reference_id) => {
    await ConfigDao.deleteConfigRef(reference_id).catch(e => {
        logger.error('[deleteConfigRef]:',e);
        return Promise.reject(e)
    });
    return Promise.resolve(reference_id);
};

/**
 * 引用列表
 * @param config_id
 * @return {*[]}
 */
ConfigService.getConfigRefByConfigId = async(config_id) => {
    let list = await ConfigDao.getConfigRefByConfigId(config_id);
    let refList = [];
    list.forEach(configFile => {
        let obj = {
            id :    configFile.reference_id,
            config_id : configFile.config_id,
            reference : {
                id : configFile.t_config_file.id,
                server_name : configFile.t_config_file.server_name,
                node_name   : configFile.t_config_file.host,
                set_name    : configFile.t_config_file.set_name,
                set_area    : configFile.t_config_file.set_area,
                set_group   : configFile.t_config_file.set_group,
                filename    : configFile.t_config_file.filename,
                config      : configFile.t_config_file.config,
                level       : configFile.t_config_file.level,
                posttime    : formatToStr(new Date(configFile.t_config_file.posttime), 'yyyy-mm-dd hh:mm:ss')
            }
        };
        refList.push(obj);
    });
    return refList;
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
            let configFile = await ConfigDao.insertConfigFile(newRow);
            configFile = configFile.dataValues;
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
    const addConfigFileByFileName = async function () {
        const [application, serverName] = params.server_name.split('.');
        const enableSet = params.set_name && params.set_area && params.set_group;
        const servers = await ServerDao.getServerConf({
            application :   application,
            serverName  :   serverName,
            enableSet   :   enableSet,
            setName     :   params.set_name,
            setArea     :   params.set_area,
            setGroup    :   params.set_group
        });
        for(let i=0,len=servers.length;i<len;i++) {
            let server = servers[i];
            let newRow = Object.assign({},{
                server_name :   params.server_name,
                set_name    :   params.set_name,
                set_area    :   params.set_area,
                set_group   :   params.set_group,
                filename    :   params.filename,
                config      :   '',
                host        :   server.node_name,
                posttime    :   formatToStr(new Date(), 'yyyy-mm-dd hh:mm:ss'),
                lastuser    :   config.lastuser,
                level       :   3,
            });
            let configFile = await ConfigDao.insertConfigFile(newRow);
            configFile = configFile.dataValues;
            const history = {
                configid    :   configFile.id,
                reason      :   'add config',
                content     :   configFile.config,
                posttime    :   configFile.posttime
            };
            ConfigDao.insertConfigFileHistory(history).catch(e => logger.error('[insertConfigFileHistory]:',e));
        }
    };



    let keys = Array.from(Object.keys(params));
    if(keys.includes('nodeName')){
        addConfigFileByNodeName();
    }else{
        addConfigFileByFileName();
    }
}


module.exports = ConfigService;