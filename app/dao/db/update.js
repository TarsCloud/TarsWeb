const Sequelize = require('sequelize');

const DbUpdate = { };

DbUpdate.updateApplication = async (dbTaf, dbWeb) => {

    let data = await dbTaf.tServerConf.findAll({
        attributes: [[Sequelize.literal('distinct `application`'), 'application']]
    });

    data.forEach(async (item) => {
        if (!await dbWeb.tApplication.findOne({ where: { f_name: item.application } })) {
            
            await dbWeb.tApplication.create({ f_name: item.application, f_create_person: 'admin', f_create_time: new Date(), f_update_person: 'admin', f_update_time: new Date() });
        }
    });

}

DbUpdate.update = async (dbTaf, dbWeb) => {

    try {
        await DbUpdate.updateApplication(dbTaf, dbWeb);
    } catch (e) {
        
    }
}


module.exports = DbUpdate;

