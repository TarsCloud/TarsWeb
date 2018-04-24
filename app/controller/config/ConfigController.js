/**
 * Created by clauseliu on 2018/4/18.
 */

const logger = require('../../logger');
const ConfigService = require('../../service/config/ConfigService');

const ConfigController = {};

ConfigController.index = async(ctx) => {
    await ctx.render('index', {
        title: 'tars title#common.servername#'
    });
};


ConfigController.configFileList = async(ctx) => {
    let {level, application, set_name, set_area, set_group, server_name} = ctx.paramsObj;
    let list = [];
    try{
        switch(level) {
            case '1' :
                list = await ConfigService.getApplicationConfigFile(application);
                break;
            case '2' :
                if(!set_name) {
                    return ctx.makeResObj(500, 'set_name #common.notempty#');
                }
                list = await ConfigService.getSetConfigFile({server_name:application, set_name:set_name});
                break;
            case '3' :
                if(!set_name || !set_area){
                    return ctx.makeResObj(500, 'set_name,set_area #common.notempty#');
                }
                list = await ConfigService.getSetConfigFile({server_name:application, set_name:set_name, set_area:set_area});
                break;
            case '4' :
                if(!set_name || !set_area || !set_group){
                    return ctx.makeResObj(500, 'set_name,set_area,set_group #common.notempty#');
                }
                list = await ConfigService.getSetConfigFile({server_name:application, set_name:set_name, set_area:set_area, set_group:set_group});
                break;
            case '5' :
                if(!server_name){
                    return ctx.makeResObj(500, 'server_name #common.notempty#');
                }
                list = await ConfigService.getServerConfigFile({server_name:`${application}.${server_name}`, set_name:set_name, set_area:set_area, set_group:set_group});
                break;
        }
        ctx.makeResObj(200, '', list);
    }catch(e){
        logger.error(e);
        ctx.makeErrResObj(500, e.toString());
    }
};

ConfigController.addConfigFile = async(ctx) => {
    let params = ctx.paramsObj;
    try{
        ctx.makeResObj(200, '', await ConfigService.addConfigFile(params));
    }catch(e){
        logger.error(e);
        ctx.makeErrResObj(500, e.toString());
    }
};

ConfigController.deleteConfigFile = async(ctx) => {
    let id = ctx.paramsObj.id;
    try{
        ctx.makeResObj(200, '', await ConfigService.deleteConfigFile(id));
    }catch(e) {
        logger.error(e);
        ctx.makeErrResObj(500, e.toString());
    }
};

ConfigController.updateConfigFile = async(ctx) => {
    let params = ctx.paramsObj;
    try{
        ctx.makeResObj(200, '', await ConfigService.updateConfigFile(params));
    }catch(e){
        logger.error(e);
        ctx.makeErrResObj(500, e.toString());
    }
};

ConfigController.configFile = async(ctx) => {
    let id = ctx.paramsObj.id;
    try{
        ctx.makeResObj(200, '', await ConfigService.getConfigFile(id));
    }catch(e){
        logger.error(e);
        ctx.makeErrResObj(500, e.toString());
    }
};

ConfigController.nodeConfigFileList = async(ctx) => {
    let params = ctx.paramsObj;
    try{
        ctx.makeResObj(200, '', await ConfigService.getNodeConfigFile(params));
    }catch(e){
        logger.error(e);
        ctx.makeErrResObj(500, e.toString());
    }
};

ConfigController.getConfigFileHistory = async(ctx) => {
    let id = ctx.paramsObj.id;
    try{
        ctx.makeResObj(200, '', await ConfigService.getConfigFileHistory(id));
    }catch(e){
        logger.error(e);
        ctx.makeErrResObj(500, e.toString());
    }
};

ConfigController.configFileHistoryList = async(ctx) => {
    let config_id = ctx.paramsObj.config_id;
    try{
        ctx.makeResObj(200, '', await ConfigService.getConfigFileHistoryList(config_id));
    }catch(e){
        logger.error(e);
        ctx.makeErrResObj(500, e.toString());
    }
};

ConfigController.addConfigRef = async(ctx) => {
    let {config_id, reference_id} = ctx.paramsObj;
    try{
        ctx.makeResObj(200, '', await ConfigService.addConfigRef(config_id, reference_id));
    }catch(e){
        logger.error(e);
        ctx.makeErrResObj(500, e.toString());
    }
};

ConfigController.deleteConfigRef = async(ctx) => {
    let id = ctx.paramsObj.id;
    try{
        ctx.makeResObj(200, '', await ConfigService.deleteConfigRef(id));
    }catch(e){
        logger.error(e);
        ctx.makeErrResObj(500, e.toString());
    }
};

ConfigController.configRefList = async(ctx) => {
    let config_id = ctx.paramsObj.config_id;
    try{
        ctx.makeResObj(200, '', await ConfigService.getConfigRefByConfigId(config_id));
    }catch(e){
        logger.error(e);
        ctx.makeErrResObj(500, e.toString());
    }
};

ConfigController.mergedNodeConfig = async(ctx) => {
    let id = ctx.paramsObj.id;
    try{
        //ctx.makeResObj(200, '', await ConfigService.getConfigRefByConfigId(id));
    }catch(e){
        logger.error(e);
        ctx.makeErrResObj(500, e.toString());
    }
};


ConfigController.pushConfigFile = async(ctx) => {
    let ids = ctx.paramsObj.ids;
    try{
        //ctx.makeResObj(200, '', await ConfigService.getConfigRefByConfigId(id));
    }catch(e){
        logger.error(e);
        ctx.makeResObj(500, e.toString());
    }
};





module.exports = ConfigController;