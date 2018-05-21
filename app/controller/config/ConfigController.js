/**
 * Created by clauseliu on 2018/4/18.
 */

const logger = require('../../logger');
const ConfigService = require('../../service/config/ConfigService');
const AdminService = require('../../service/admin/AdminService');

const util = require('../../tools/util');

const ConfigController = {};

const configListStruct = {id:'',server_name:'',set_name:'',set_area:'',host:{key:'node_name'},set_group:'',filename:'',config:'',level:'',posttime:{formatter:util.formatTimeStamp},lastuser:''};


ConfigController.getUnusedApplicationConfigFile = async(ctx) => {
    let {config_id, application} = ctx.paramsObj;
    try{
        ctx.makeResObj(200, '', await ConfigService.getUnusedApplicationConfigFile(application, config_id));
    }catch(e){
        logger.error(e);
        ctx.makeErrResObj(500, e.toString());
    }
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
        ctx.makeResObj(200, '', util.viewFilter(list,configListStruct));
    }catch(e){
        logger.error(e);
        ctx.makeErrResObj(500, e.toString());
    }
};

ConfigController.addConfigFile = async(ctx) => {
    let params = ctx.paramsObj;
    try{
        let ret = await ConfigService.addConfigFile(params);
        ctx.makeResObj(200, '', util.viewFilter(ret,configListStruct));
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
        let ret = await ConfigService.updateConfigFile(params);
        ctx.makeResObj(200, '', util.viewFilter(ret,configListStruct));
    }catch(e){
        logger.error(e);
        ctx.makeErrResObj(500, e.toString());
    }
};

ConfigController.configFile = async(ctx) => {
    let id = ctx.paramsObj.id;
    try{
        let ret = await ConfigService.getConfigFile(id);
        ctx.makeResObj(200, '', util.viewFilter(ret,configListStruct));
    }catch(e){
        logger.error(e);
        ctx.makeErrResObj(500, e.toString());
    }
};

ConfigController.nodeConfigFileList = async(ctx) => {
    let {application, set_name, set_area, set_group, server_name, config_id} = ctx.paramsObj;
    try{
        let list = await ConfigService.getNodeConfigFile({
            application:application,
            server_name:server_name,
            set_name:set_name,
            set_area:set_area,
            set_group:set_group,
            config_id:config_id
        });
        ctx.makeResObj(200, '', util.viewFilter(list,configListStruct));
    }catch(e){
        logger.error(e);
        ctx.makeErrResObj(500, e.toString());
    }
};

ConfigController.getConfigFileHistory = async(ctx) => {
    let {id, currPage = 0, pageSize = 0} = ctx.paramsObj;
    try{
        let ret = await ConfigService.getConfigFileHistory(id, currPage, pageSize);
        ctx.makeResObj(200, '', util.viewFilter(ret,{id:'',config_id:'',reason:'',content:'',posttime:{formatter:util.formatTimeStamp}}));
    }catch(e){
        logger.error(e);
        ctx.makeErrResObj(500, e.toString());
    }
};

ConfigController.configFileHistoryList = async(ctx) => {
    let config_id = ctx.paramsObj.config_id;
    try{
        let list = await ConfigService.getConfigFileHistoryList(config_id);
        ctx.makeResObj(200, '', util.viewFilter(list,{id:'',config_id:'',reason:'',content:'',posttime:{formatter:util.formatTimeStamp}}));
    }catch(e){
        logger.error(e);
        ctx.makeErrResObj(500, e.toString());
    }
};

ConfigController.addConfigRef = async(ctx) => {
    let {config_id, reference_id} = ctx.paramsObj;
    try{
        let ret = await ConfigService.addConfigRef(config_id, reference_id);
        ctx.makeResObj(200, '', util.viewFilter(ret,{id:'',config_id:'',reference_id:''}));
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
        let configFile = await ConfigService.getConfigFile(id);
        ctx.makeResObj(200, '', await AdminService.loadConfigByHost(configFile.server_name, configFile.filename, configFile.host));
    }catch(e){
        logger.error(e);
        ctx.makeErrResObj(500, e.toString());
    }
};


ConfigController.pushConfigFile = async(ctx) => {
    let ids = ctx.paramsObj.ids;
    try{
        ids = ids.split(/[,;]/);
        let list = await ConfigService.getConfigFileList(ids);
        let filename = '';
        let targets = list.map(configFile => {
            let [application, server_name] = configFile.server_name.split('.');
            filename = configFile.filename;
            return {
                application : application,
                serverName : server_name,
                nodeName : configFile.host
            };
        });

        ctx.makeResObj(200, '', await AdminService.doCommand(targets, `tars.loadconfig ${filename}`));
    }catch(e){
        logger.error(e);
        ctx.makeErrResObj(500, e.toString());
    }
};





module.exports = ConfigController;