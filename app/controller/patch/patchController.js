/**
 * Created by clauseliu on 2018/5/17.
 */
const logger = require('../../logger');
const PatchService = require('../../service/patch/PatchService');
const AuthService = require('../../service/auth/AuthService');
const WebConf = require('../../../config/webConf');
const util = require('../../tools/util');
const fs = require('fs-extra');
const md5Sum = require('md5-file').sync;


const PatchController = {};

PatchController.uploadPatchPackage = async (ctx) => {
    try{
        let {application, module_name, md5, task_id, comment} = ctx.req.body;
        if (!await AuthService.hasDevAuth(application, module_name, ctx.uid)) {
            ctx.makeNotAuthResObj();
        } else {
            let file = ctx.req.file;
            if(!file) {
                logger.error('[uploadPatchPackage]:','no files');
                return ctx.makeErrResObj(500,'no files');
            }
            let baseUploadPath = WebConf.pkgUploadPath.path;
            // 发布包上传目录
            let updateTgzPath = `${baseUploadPath}/${application}/${module_name}`;
            await fs.ensureDirSync(updateTgzPath);
            let hash = md5Sum(`${baseUploadPath}/${file.filename}`);
            if(md5 && md5!=hash) {
                return ctx.makeErrResObj(500,'#patch.md5#');
            }
            let uploadTgzName = `${application}.${module_name}_${file.fieldname}_${hash}.tgz`;
            logger.info('[newTgzName]:',`${updateTgzPath}/${uploadTgzName}`);
            logger.info('[orgTgzName]:',`${baseUploadPath}/${file.filename}`);
            await fs.rename(`${baseUploadPath}/${file.filename}`, `${updateTgzPath}/${uploadTgzName}`);
            let paramsObj = {
                server : `${application}.${module_name}`,
                tgz : uploadTgzName,
                md5 : hash,
                update_text : comment || '',
                task_id : task_id,
                posttime : new Date()
            };
            logger.info('[addServerPatch:]',paramsObj);
            let ret = await PatchService.addServerPatch(paramsObj);

            ctx.makeResObj(200,'',util.viewFilter(ret,{id:'',server:'',tgz:'',update_text:{key:'comment'},posttime:{formatter:util.formatTimeStamp}}));
        }
    }catch (e) {
        logger.error(e);
        ctx.makeErrResObj(500, e.toString());
    }

};

PatchController.serverPatchList = async (ctx) => {
    let {application, module_name, currPage = 0, pageSize = 0} = ctx.paramsObj;
    try{
        if (!await AuthService.hasDevAuth(application, module_name, ctx.uid)) {
            ctx.makeNotAuthResObj();
        } else {
            let list = await PatchService.getServerPatch(application, module_name, currPage, pageSize);
            ctx.makeResObj(200,'',util.viewFilter(list,{id:'',server:'',tgz:'',update_text:{key:'comment'},posttime:{formatter:util.formatTimeStamp}}));
        }
    }catch(e) {
        logger.error(e);
        ctx.makeErrResObj(500, e.toString());
    }
};

PatchController.getServerPatchByTaskId = async (ctx) => {
    let {task_id} = ctx.paramsObj;
    try{
        let ret = await PatchService.getServerPatchByTaskId(task_id);
        ctx.makeResObj(200,'',util.viewFilter(ret,{id:'',server:'',tgz:'',task_id:'',update_text:{key:'comment'},posttime:{formatter:util.formatTimeStamp}}));
    }catch(e) {
        logger.error(e);
        ctx.makeErrResObj(500, e.toString());
    }
};

PatchController.getTagList = async (ctx) => {
    let {application, module_name} = ctx.paramsObj;
    try{
        if (!await AuthService.hasDevAuth(application, module_name, ctx.uid)) {
            ctx.makeNotAuthResObj();
        } else {
            let list = await PatchService.getTagList(application, module_name);
            ctx.makeResObj(200,'',util.viewFilter(list,{path:'',version:'',commitMessage:''}));
        }
    }catch(e) {
        logger.error(e);
        ctx.makeErrResObj(500, e.toString());
    }
};

PatchController.getCompilerUrl = async (ctx) => {
    try{
        let ret = await PatchService.getCompilerUrl();
        ctx.makeResObj(200,'',ret);
    }catch(e) {
        logger.error(e);
        ctx.makeErrResObj(500, e.toString());
    }
};

PatchController.setCompilerUrl = async (ctx) => {
    let {tagList, compiler, task} = ctx.paramsObj;
    try{
        let ret = await PatchService.setCompilerUrl(tagList, compiler, task);
        ctx.makeResObj(200,'',ret);
    }catch(e) {
        logger.error(e);
        ctx.makeErrResObj(500, e.toString());
    }
};

PatchController.doCompile = async (ctx) => {
    let {application, server_name, node, path, version, comment, compileUrl} = ctx.paramsObj;
    try{
        if (!await AuthService.hasDevAuth(application, server_name, ctx.uid)) {
            ctx.makeNotAuthResObj();
        } else {
            let ret = await PatchService.doCompile({application, server_name, node, path, version, comment, compileUrl});
            ctx.makeResObj(200,'',ret);
        }
    }catch(e) {
        logger.error(e);
        ctx.makeErrResObj(500, e.toString());
    }
};

PatchController.compilerTask = async (ctx) => {
    let {taskNo} = ctx.paramsObj;
    try {
        let ret = await PatchService.compilerTask(taskNo);
        ctx.makeResObj(200, '', ret);
    }catch(e) {
        logger.error(e);
        ctx.makeErrResObj(500, e.toString());
    }
};

module.exports = PatchController;