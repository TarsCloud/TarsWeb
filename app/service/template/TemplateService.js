const TemplateDao = require('../../dao/TemplateDao');
const ServerService = require('../../service/server/ServerService');
const logger = require('../../logger');
const util = require('../../tools/util');
const TemplateService = {};

TemplateService.addTemplate = async(templateName, parentsName, profile) => {
    let template = {
        templateName: templateName,
        parentsName: parentsName,
        profile: profile,
        posttime: new Date(),
        lastUser: ''
    };
    return await TemplateDao.addTemplate(template);
}

TemplateService.deleteTemplate = async(id) => {
    let template = await TemplateService.getTemplateById(id);
    if (!template) {
        throw new Error('没有匹配到要删除的模板');
        return;
    }
    let ref = await ServerService.getServerConfByTemplate(template.dataValues.template_name);
    if (ref.length) {
        throw new Error('模板被服务引用，不能删除');
        return;
    }
    return await TemplateDao.deleteTemplate(id);
};

TemplateService.updateTemplate = async(params)=> {
    let template = await TemplateService.getTemplateById(params.id);
    if (!template) {
        throw new Error('没有匹配到要删除的模板');
        return;
    }
    template = template.dataValues;
    if(params.template_name.toLowerCase() !== template.template_name.toLowerCase()){
        let ref = await ServerService.getServerConfByTemplate(template.template_name);
        if (ref.length) {
            throw new Error('模板被服务引用，不能更新模板名称');
            return;
        }
    }
    let parent = await TemplateService.getTemplateByName(params.parents_name);
    if(!parent){
        throw new Error('指定的父模板不存在');
        return;
    }
    params.posttime = new Date()
    return await TemplateDao.updateTemplate(params);
};

TemplateService.getTemplateById = async(id)=> {
    return await TemplateDao.getTemplateById(id);
};

TemplateService.getTemplateByName = async(templateName) => {
    return await TemplateDao.getTemplateByName(templateName);
};

TemplateService.getTemplateList = async(templateName, parentsName) => {
    return await TemplateDao.getTemplateList(templateName, parentsName);
};


module.exports = TemplateService;