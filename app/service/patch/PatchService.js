/**
 * Created by clauseliu on 2018/5/17.
 */
const PatchDao = require('../../dao/PatchDao');
const request = require('request-promise-any');

const PatchService = {};

PatchService.addServerPatch = async (params) => {
    return await PatchDao.insertServerPatch(params);
};

PatchService.getServerPatch = async (application, server_name, curPage, pageSize) => {
    return await PatchDao.getServerPatch(`${application}.${server_name}`, curPage, pageSize);
};

PatchService.getTagList = async (application, server_name) => {
    let ret = await PatchDao.getCompilerUrl();
    let tagListUrl;
    if(ret) {
        tagListUrl = ret.f_taglist_uri;
    }
    if(!tagListUrl) {
        return Promise.resolve('');
    }
    return await request({
        uri: tagListUrl,
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

PatchService.getCompilerUrl = async () => {
    return await PatchDao.getCompilerUrl();
};

PatchService.setCompilerUrl = async (tagList, compiler, task) => {
    return await PatchDao.setCompilerUrl(tagList, compiler, task);
};

PatchService.doCompile = async (params) => {
    return await request({
        method: 'POST',
        uri: params.compileUrl,
        body: params,
        json :true
    });
};

PatchService.compilerTask = async (taskNo) => {
    if(!PatchService.compilerUri){
        PatchService.compilerUri = await PatchDao.getCompilerUrl();
    }
    return await request({
        method: 'GET',
        uri: PatchService.compilerUri.f_compile_task_uri,
        qs: {taskNo},
        json :true
    });
};

module.exports = PatchService;