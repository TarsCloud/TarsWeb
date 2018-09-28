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
const TarsClient = require('./TarsClient');
const TarsParser = require('./TarsParser/TarsParser');
const InfTestDao = require('../../dao/InfTestDao');

const fs = require('fs-extra');

const InfTestService = {};


InfTestService.debug = async (paramObj) => {
    let context = await getContextFromDB(paramObj.id);
    context = JSON.parse(context.context);
    let interface = context[paramObj.moduleName].interfaces[paramObj.interfaceName];
    let client = new TarsClient(context, interface, paramObj.objName);
    let ret = await client.invoke(paramObj.functionName, JSON.parse(paramObj.params));
    return ret.response;
}

InfTestService.addTarsFile = async (params) => {
    await InfTestDao.addTarsFile(params);
    delete params.context;
    delete params.posttime;
    return (await InfTestService.getTarsFile(params, ['f_id', 'application', 'server_name', 'file_name', 'posttime']))[0];
}

InfTestService.getTarsFile = async (params, fields) => {
    return await InfTestDao.getTarsFile(params, fields);
}

InfTestService.getContext = async (tarsFilePath) => {
    return await getContext(tarsFilePath);
}

async function getContext(tarsFilePath) {
    const content = await fs.readFile(tarsFilePath);
    const parser = new TarsParser();
    let context = {};
    parser.parseFile(context, content.toString());
    return context;
}

async function getContextFromDB(id) {
    return await InfTestDao.getContext(id);
}

InfTestService.getAllData = async (id) =>{
    let context = (await getContextFromDB(id)).context;
    context = JSON.parse(context);
    function f(context) {
        let obj = [];
        for(let item in context) {
            if (item == 'includes') continue;
            let tmp = {
                value : item,
                label : item
            };
            if(!context[item] || JSON.stringify(context[item])=='{}') continue;
            let children = [];
            for(let i in context[item]) {
                if(i == 'interfaces' || i == 'functions') {
                    children = f(context[item][i]);
                }
            }
            if(children.length) {
                Object.assign(tmp, {children: children});
            }
            obj.push(tmp);
        }
        return obj;
    }
    return f(context);
}

InfTestService.getModuleData = async (id) =>{
    let context = (await getContextFromDB(id)).context;
    context = JSON.parse(context);
    let keys = Object.keys(context).filter(item => item != 'includes');
    return keys;
}

InfTestService.getInterfaceData = async (id, moduleName) => {
    let context = (await getContextFromDB(id)).context;
    context = JSON.parse(context);
    let keys = Object.keys(context[moduleName].interfaces);
    return keys;
}

InfTestService.getFunctionData = async (id, moduleName, interfaceName) => {
    let context = (await getContextFromDB(id)).context;
    context = JSON.parse(context);
    return Object.keys(context[moduleName].interfaces[interfaceName].functions);
}

InfTestService.getParams = async (id, moduleName, interfaceName, functionName) => {
    let context = (await getContextFromDB(id)).context;
    context = JSON.parse(context);
    let params = context[moduleName].interfaces[interfaceName].functions[functionName].params;
    return params;
}

InfTestService.deleteTarsFile = async (id) => {
    return await InfTestDao.deleteTarsFile(id);
}

 module.exports = InfTestService;