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
        let {application, module_name, md5, comment} = ctx.req.body;
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


module.exports = PatchController;