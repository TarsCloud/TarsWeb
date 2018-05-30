const logger = require('../../logger');
const TemplateService = require('../../service/template/TemplateService');
const _ = require('lodash');
const util = require('../../tools/util');
const AuthService = require('../../service/auth/AuthService');

const templateStruct = {
    id: '',
    template_name: '',
    parents_name: '',
    profile: '',
    posttime: {formatter: util.formatTimeStamp}
};

const TemplateController = {};

TemplateController.addTemplate = async(ctx) => {
    try {
        let templateName = ctx.paramsObj.template_name;
        let parentsName = ctx.paramsObj.parents_name;
        let profile = ctx.paramsObj.profile;
        ctx.makeResObj(200, '', util.viewFilter(await TemplateService.addTemplate(templateName, parentsName, profile), templateStruct));
    } catch (e) {
        logger.error('[addTemplate]', e);
        ctx.makeErrResObj();
    }
};

TemplateController.deleteTemplate = async(ctx) => {
    try {
        let id = ctx.paramsObj.id;
        await TemplateService.deleteTemplate(id);
        ctx.makeResObj(200, '', [id]);
    } catch (e) {
        logger.error('[addTemplate]', e);
        ctx.makeErrResObj();
    }
};

TemplateController.updateTemplate = async(ctx) => {
    try {
        let params = ctx.paramsObj;
        await TemplateService.updateTemplate(params);
        ctx.makeResObj(200, '', util.viewFilter(await TemplateService.getTemplateById(params.id), templateStruct));
    } catch (e) {
        logger.error('[addTemplate]', e);
        ctx.makeErrResObj();
    }
};

TemplateController.getTemplate = async(ctx) => {
    try {
        let templateName = ctx.paramsObj.profile_template;
        ctx.makeResObj(200, '', util.viewFilter(await TemplateService.getTemplateByName(templateName), templateStruct));
    } catch (e) {
        logger.error('[getTemplate]', e);
        ctx.makeErrResObj();
    }
};

TemplateController.getTemplateList = async(ctx) => {
    try {
        let templateName = ctx.paramsObj.template_name || '';
        let parentsName = ctx.paramsObj.parents_name || '';
        ctx.makeResObj(200, '', util.viewFilter(await TemplateService.getTemplateList(templateName, parentsName), templateStruct));
    } catch (e) {
        logger.error('[getTemplateList]', e);
        ctx.makeErrResObj();
    }
};
TemplateController.getTemplateNameList = async(ctx)=> {
    try {
        let templateList = await TemplateService.getTemplateList('', '');
        let templateNameList = [];
        templateList.forEach((template)=> {
            templateNameList.push(template.dataValues.template_name);
        });
        ctx.makeResObj(200, '', templateNameList);
    } catch (e) {
        logger.error('[getTemplateNameList]', e);
        ctx.makeErrResObj();
    }
};


module.exports = TemplateController;