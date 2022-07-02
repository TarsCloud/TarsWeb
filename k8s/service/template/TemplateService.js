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

const CommonService = require('../common/CommonService');
const ConfigParser = require('@tars/utils').Config;
const logger = require('../../../logger')
const TemplateService = {};

TemplateService.buildTTemplate = (templateName, templateParent, templateContent) => {

    let tTemplate = {
        apiVersion: CommonService.GROUP + '/' + CommonService.VERSION,
        kind: 'TTemplate',
        metadata: {
            namespace: CommonService.NAMESPACE,
            name: templateName.toLowerCase()
        },
        spec: {
            content: templateContent,
            parent: templateParent,
        },
    }

    return { ret: 200, msg: "succ", data: tTemplate };
}

TemplateService.templateCreate = async (metadata) => {

    let tTemplateList = await CommonService.getTemplateList();

    // tTemplateList = tTemplateList.items;

    let index = -1;
    for (let i = 0; i < tTemplateList.length; i++) {
        if (tTemplateList[i].metadata.name == metadata.TemplateName) {

            index = i;
            break;
        }
    }

    if (index != -1) {
        return { ret: 500, msg: 'template exists' };
    }

    // console.log(metadata);

    let data = TemplateService.buildTTemplate(metadata.TemplateName, metadata.TemplateParent, metadata.TemplateContent)

    if (data.ret != 200) {
        return data;
    }

    let result = await CommonService.createObject("ttemplates", data.data);

    return { ret: 200, msg: 'succ', data: result.body };
}

TemplateService.templateSelect = async (TemplateName, ParentName) => {

    let allItems = await CommonService.getTemplateList();

    // let allItems = tTemplateList.items;

    let filterItems = [];

    allItems.forEach(elem => {

        if (TemplateName.length > 0 && elem.metadata.name.indexOf(TemplateName) == -1)
            return;

        if (ParentName.length > 0 && elem.spec.parent.indexOf(ParentName) == -1)
            return;

        filterItems.push(elem);
    })

    allItems = filterItems;

    // Count填充
    let result = {};
    // result.Count = {};
    // result.Count["AllCount"] = allItems.length;
    // result.Count["FilterCount"] = filterItems.length;

    // Data填充
    result.Data = [];
    filterItems.forEach(item => {

        let elem = {};

        elem["TemplateId"] = item.metadata.name
        elem["TemplateName"] = item.metadata.name
        elem["TemplateParent"] = item.spec.parent
        elem["TemplateContent"] = item.spec.content
        elem["UpdateTime"] = item.metadata.creationTimestamp

        result.Data.push(elem);
    })

    return { ret: 200, msg: 'succ', data: result };

}

TemplateService.templateUpdate = async (metadata, target) => {

    let tTemplate = await CommonService.getObject("ttemplates", metadata.TemplateId);

    if (!tTemplate) {
        return { ret: 500, msg: 'template not exists' };
    }

    tTemplate = tTemplate.body;

    let tTemplateCopy = JSON.parse(JSON.stringify(tTemplate));

    tTemplateCopy.spec.parent = target.TemplateParent
    tTemplateCopy.spec.content = target.TemplateContent

    let data = await CommonService.replaceObject("ttemplates", metadata.TemplateId, tTemplateCopy);

    return { ret: 200, msg: 'succ', data: data.body };
}

TemplateService.templateDelete = async (metadata) => {

    let data = await CommonService.deleteObject("ttemplates", metadata.TemplateId)

    return { ret: 200, msg: 'succ', data: data.body };
}

TemplateService.getEsConfig = async () => {
    let ret = {}
    try {
        let esTemplate = await TemplateService.templateSelect("tars.es", "tars.default");

        let templateContent = esTemplate.data.Data[0].TemplateContent;
        let configParser = new ConfigParser();
        configParser.parseText(templateContent);
        ret = configParser.data
    } catch (e) {
        logger.error("[get es config error]:" + e);
        throw new Error("get es config error")
    }
    return ret;
}

module.exports = TemplateService;
