/**
 * Created by clauseliu on 2018/4/20.
 */

const {tConfigFiles,tConfigHistoryFiles,tConfigReferences} = require('./db');

let ConfigDao = {};

ConfigDao.getApplicationConfigFile = async (application) => {
    return await tConfigFiles.findAll({
        where : {
            level       :   1,
            server_name :   application
        }
    });
};

ConfigDao.getSetConfigFile = async (params) => {
    let whereObj = Object.assign({level:1},params);

    return await tConfigFiles.findAll({
        where : whereObj
    });
};

ConfigDao.getServerConfigFile = async (params) => {
    let whereObj = Object.assign({level:2},filterParams(params));
    return await tConfigFiles.findAll({
        where : whereObj
    });
};

ConfigDao.insertConfigFile = async (params) => {
    return await tConfigFiles.create(params);
};

ConfigDao.insertConfigFileHistory = async (params) => {
    return await tConfigHistoryFiles.create(params);
};

ConfigDao.loadConfigFile = async (id) => {
    return await tConfigFiles.findAll({
        where : {id : id}
    });
};

ConfigDao.getNodeConfigFile = async (params) => {
    let whereObj = Object.assign({level:3},filterParams(params));
    return await tConfigFiles.findAll({
        where : whereObj
    });
};

ConfigDao.deleteConfigFile = async (id) => {
    return await tConfigFiles.destroy({where: {id:id}});
};

ConfigDao.getConfigRefByRefId = async (id) => {
    return await tConfigReferences.findAll({where: {reference_id:id}});
};

ConfigDao.updateConfigFile = async (params) => {
    return await tConfigFiles.update(
        params,
        {where : {id : params.id}}
    );
};



function filterParams(obj) {
    for(var item in obj) {
        if(!obj[item]){
            delete obj[item];
        }
    }
    return obj;
}

module.exports = ConfigDao;