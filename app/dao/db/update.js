const Sequelize = require('sequelize');

const DbUpdate = { };

DbUpdate.updateApplication = async (dbTars, dbWeb) => {

    let data = await dbTars.tServerConf.findAll({
        attributes: [[Sequelize.literal('distinct `application`'), 'application']]
    });

    data.forEach(async (item) => {
        if (!await dbWeb.tApplication.findOne({ where: { f_name: item.application } })) {
            
            await dbWeb.tApplication.create({ f_name: item.application, f_create_person: 'admin', f_create_time: new Date(), f_update_person: 'admin', f_update_time: new Date() });
        }
    });

}

DbUpdate.update = async (dbTars, dbWeb) => {

    try {
        await DbUpdate.updateApplication(dbTars, dbWeb);
    } catch (e) {
        
    }
}


module.exports = DbUpdate;

