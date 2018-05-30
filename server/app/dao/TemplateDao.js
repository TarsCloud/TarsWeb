const {tProfileTemplate} = require('./db').db_tars;
const Sequelize = require('sequelize');

const TemplateDao = {};

TemplateDao.addTemplate = async(params) => {
    return await tProfileTemplate.create({
        template_name: params.templateName,
        parents_name: params.parentsName,
        profile: params.profile,
        posttime: params.posttime,
        lastuser: params.lastUser
    });
};

TemplateDao.deleteTemplate = async(id) => {
    return await tProfileTemplate.destroy({
        where: {
            id: id
        }
    });
};

TemplateDao.updateTemplate = async(params) => {
    return await tProfileTemplate.update({
        template_name: params.template_name,
        parents_name: params.parents_name,
        profile: params.profile,
        posttime: params.posttime,
    }, {
        where: {
            id: params.id
        }
    });
};

TemplateDao.getTemplateById = async(id) => {
    return await tProfileTemplate.findOne({
        where: {
            id
        }
    });
};

TemplateDao.getTemplateByName = async(templateName) => {
    return await tProfileTemplate.findOne({
        where: {
            template_name: templateName
        }
    });
};

TemplateDao.getTemplateList = async(templateName, parentsName) => {
    return await tProfileTemplate.findAll({
        where: {
            template_name: {
                $like: '%' + templateName + '%'
            },
            parents_name: {
                $like: '%' + parentsName + '%'
            }
        }
    });
};

module.exports = TemplateDao;