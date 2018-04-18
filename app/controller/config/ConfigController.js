/**
 * Created by clauseliu on 2018/4/18.
 */

const ConfigService = require('../../service/config/ConfigService');

const ConfigController = {};

ConfigController.index = async(ctx) => {
    await ctx.render('index', {
        title: 'tars title#common.servername#',
        a: ctx.paramsObj.a || '',
    });
};


ConfigController.configFileList = async(ctx) => {
    try{
        ctx.makeResObj(200, '', await ConfigService.getServerConfigFile());
    }catch(e){
        ctx.makeResObj(500, e.toString());
    }
};

ConfigController.addConfigFile = async(ctx) => {
    console.info(ctx.paramsObj);
    try{
        ctx.makeResObj(200, '', await ConfigService.addConfigFile(ctx.paramsObj));
    }catch(e){
        console.info(e);
        ctx.makeResObj(500, e.toString());
    }
};



module.exports = ConfigController;