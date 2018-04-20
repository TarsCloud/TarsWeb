/**
 * Created by clauseliu on 2018/4/20.
 */

const {tConfigFiles} = require('./db');
const logger = require('../logger');

let ConfigMapper = {};

ConfigMapper.getApplicationConfigFile = async (application) => {
    try{
        return await tConfigFiles.findAll({
            where : {
                level       :   1,
                server_name :   application
            }
        });
    }catch(e) {
        logger.error(e);
        return e;
    }
};

ConfigMapper.getSetConfigFile = async (params) => {
    try{
        let whereObj = Object.assign({level:1},params);

        return await tConfigFiles.findAll({
            where : whereObj
        });
    }catch(e) {
        logger.error(e);
        return e;
    }
};

ConfigMapper.getServerConfigFile = async (params) => {
    for(var item in params) {
        if(!params[item]){
            delete params[item];
        }
    }
    try{
        let whereObj = Object.assign({level:2},params);

        return await tConfigFiles.findAll({
            where : whereObj
        });
    }catch(e) {
        logger.error(e);
        return e;
    }
};

module.exports = ConfigMapper;