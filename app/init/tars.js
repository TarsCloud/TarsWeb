/**
 * Tencent is pleased to support the open source community by making Tars available.
 *
 * Copyright (C) 2016THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the BSD 3-Clause License (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * https://opensource.org/licenses/BSD-3-Clause
 *
 * Unless required by applicable law or agreed to in writing, software distributed
 * under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */


const PatchDao = require('../dao/PatchDao');
const webConf = require('../../config/webConf');
const exec = require('child_process').execSync;
// const Sequelize = require('sequelize');
const compressing = require('compressing');
var fs = require("fs")
var path = require("path")
const md5Sum = require('md5-file').sync;
const logger = require('../logger')

const TarsInit = {};

TarsInit.deleteDirectory = (dir) => {
    try {
        if (fs.existsSync(dir) == true) {
            var files = fs.readdirSync(dir);
            files.forEach(function(item){
                var item_path = path.join(dir, item);
                if (fs.statSync(item_path).isDirectory()) {
                    TarsInit.deleteDirectory(item_path);
                }
                else {
                    fs.unlinkSync(item_path);
                }
            });
            fs.rmdirSync(dir);
        }
    }catch(e) {
        logger.error('deleteDirectory error:', e);
    }
}
 
TarsInit.insert = async(patchTmp, patchPath, filePath, file)=> {

    let name = file.split('.');
    if(name.length != 2 || name[1] != 'tgz' || name[0].indexOf('tars') != 0) {
        return;
    }

    let src = filePath + '/' + file;
    let server = "tars." + name[0];

    let hash = md5Sum(src);

    let patch = await PatchDao.find({
        server: server,
        version: hash 
    });

    if(!patch) {

        let dstTmp = patchTmp + '/' + name[0] + '.tar';
        logger.info("uncompress tgz -> tar:", src, dstTmp)
        await compressing.gzip.uncompress(src, dstTmp);

        logger.info("uncompress tar -> dir:", dstTmp, patchTmp)
        await compressing.tar.uncompress(dstTmp, patchTmp);

        //移动可执行文件到上一层目录
        let newPatchPath = patchPath +'/' + name[0];

        logger.info("mkdir :", newPatchPath);
        fs.mkdirSync(newPatchPath, {recursive: true});

        logger.info("rename :", patchTmp + '/' + name[0] + '/bin/' + name[0], ' -> ', newPatchPath + '/' + name[0]);
        fs.renameSync(patchTmp + '/' + name[0] + '/bin/' + name[0], newPatchPath + '/' + name[0]);

        logger.info("compress to tar :", newPatchPath, ' -> ', newPatchPath + '.tar');
        await compressing.tar.compressDir(newPatchPath, newPatchPath + '.tar');
        logger.info("compress to tgz :", newPatchPath + '.tar', ' -> ', newPatchPath + '.tgz');
        await compressing.gzip.compressFile(newPatchPath + '.tar', newPatchPath + '.tgz');

        logger.info('delete dir:', newPatchPath);
        TarsInit.deleteDirectory(newPatchPath); 

        logger.info('delete file:', newPatchPath + '.tar');
        fs.unlinkSync(newPatchPath + '.tar');

        //copy 到tars.upload目录下
        let dst = webConf.pkgUploadPath.path + '/tars/' + name[0] + '/';

        fs.mkdirSync(dst, {recursive: true});

        let dstFile = dst + '/' + name[0] + ".tgz";
        fs.copyFileSync(newPatchPath + '.tgz', dstFile);

        let md5hash = md5Sum(dstFile);

        var params = {
            server: server,
            version: hash,
            tgz: file,
            update_text: 'system install',
            publish: 0,
            posttime: new Date(),
            postuser: 'web',
            upload_time: new Date(),
            upload_user: 'admin',
            md5: md5hash
        }

        await PatchDao.insertServerPatch(params);

        logger.info("parepare taf patch package succ");
    }

};

TarsInit.preparePatch = async() => {

    var dir = path.join(__dirname, "../../files");

    if (fs.existsSync(dir)) {
        let files = fs.readdirSync(dir);

        if (files) {

            let patchTmp = dir + '/patchTmp';
            let patchPath = dir + '/patch';
    
            fs.mkdirSync(patchTmp, { recursive: true });
            fs.mkdirSync(patchPath, { recursive: true });

            logger.info("mkdir :", patchTmp, patchPath);

            files.map(async (file) => {
                let filePath = path.join(dir, file);

                if (fs.statSync(filePath).isFile()) {
                    await TarsInit.insert(patchTmp, patchPath, dir, file);
                }
            });

            //删除临时文件
            // logger.info('delete dir:', patchTmp);
            // TarsInit.deleteDirectory(patchTmp);
        }
    }
};

module.exports = TarsInit;