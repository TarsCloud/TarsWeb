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
// const Sequelize = require('sequelize');
var fs = require("fs")
var path = require("path")
const md5Sum = require('md5-file').sync;

const TarsInit = {};

TarsInit.insert = async(filePath, file)=> {

    let name = file.split('.');
    if(name.length != 2 || name[1] != 'tgz' || name[0].indexOf('tars') != 0) {
        return;
    }

    let hash = md5Sum(`${filePath}/${file}`);

    let patch = await PatchDao.find({
        server: "tars." + name[0],
        md5: hash 
    });

    if(!patch) {
        var params = {
            server: "tars." + name[0],
            version: 'init',
            tgz: file,
            update_text: 'system install',
            publish: 0,
            posttime: new Date(),
            postuser: 'user',
            upload_time: new Date(),
            upload_user: 'admin',
            md5: hash
        }

        // console.log(patch);

        console.log(params);

        await PatchDao.insertServerPatch(params);
    }

};

TarsInit.loadPatch = async() => {

    var filePath = path.join(__dirname, "../../files");

    fs.readdir(filePath,function(err,menu){	
		if(!menu)
            return;

        menu.forEach(function(ele){
            fs.stat(filePath + "/" + ele, function(err,info){
				if(info.isFile()) {
                    TarsInit.insert(filePath, ele);
				}
			})
        });
    });
};

module.exports = TarsInit;