/**
 * Created by clauseliu on 2018/6/21.
 */

const PatchDao = require('../../dao/PatchDao');
const request = require('request-promise-any');
const compileConf = require('../../../config/compileConf');
const CompileService = {};

CompileService.addPatchTask = async (params) => {
    return await PatchDao.insertPatchTask(params);
};

CompileService.getServerPatchByTaskId = async (taskId) => {
    let {tgz} = await PatchDao.getPackageByTaskId(taskId);
    return await PatchDao.getServerPatchByPkgName(tgz);
};

CompileService.getTagList = async (application, server_name) => {
    /*let ret = await PatchDao.getCodeInfConf(application, server_name);
    let tagListUrl;
    if(ret) {
        tagListUrl = ret.path;
    }
    if(!tagListUrl) {
        return Promise.resolve('');
    }*/
    return await request({
        uri: compileConf.getVersionList,
        qs: {
            application,
            server_name,
        },
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json :true
    });
};

CompileService.getCompilerConf = () => {
    return compileConf;
};

CompileService.getCodeInfConf = async (application, server_name) => {
    return await PatchDao.getCodeInfConf(application, server_name);
};

CompileService.setCodeInfConf = async (params) => {
    return await PatchDao.setCodeInfConf(params);
};

CompileService.doCompile = async (params) => {
    return await request({
        method: 'POST',
        uri: compileConf.compileUrl,
        body: params,
        json :true
    });
};

CompileService.compilerTask = async (taskNo) => {
    return await request({
        method: 'GET',
        uri: compileConf.compileTaskUrl,
        qs: {taskNo},
        json :true
    });
};

module.exports = CompileService;