const {tAdapterConf} = require('./db').db_tars;

const AdapterDao = {};

AdapterDao.getAdapterConfById = async(id) => {
    return await tAdapterConf.findOne({
        where: {
            id: id
        }
    });
};

AdapterDao.getAdapterConf = async(application, serverName, nodeName) => {
    return await tAdapterConf.findAll({
        where: {
            application: application,
            server_name: serverName,
            node_name: nodeName
        }
    });
};

AdapterDao.getAdapterConfByObj = async(params) =>{
    return await tAdapterConf.findOne({
        where: {
            application: params.application,
            server_name: params.serverName,
            node_name: params.nodeName,
            adapter_name: params.application + '.' + params.serverName + '.' + params.objName + 'Adapter'
        }
    });
}

AdapterDao.insertAdapterConf = async(params) => {
    return await tAdapterConf.create(params);
};

AdapterDao.deleteAdapterConf = async(id) => {
    return await tAdapterConf.destroy({
        where: {id: id}
    });
};

AdapterDao.updateAdapterConf = async(params) => {
    return await tAdapterConf.update(params, {where: {id: params.id}});
};

module.exports = AdapterDao;