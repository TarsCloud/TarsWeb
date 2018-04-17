const {
    tAdapterConf
} = require('./db');
const logger = require('logger');

var DemoDao = function(){}

DemoDao.getAdapterConfById = async (id) => {
    try{
        return await tAdapterConf.findAll({
            where: {
                id: id
            }
        });
    } catch(e){
        logger.error(e);
        throw(e);
    }
}

DemoDao.insertAdapterConf = async(adapterConf)=>{

}

DemoDao.updateAdapterConf = async(id, adapterConf)=>{

}