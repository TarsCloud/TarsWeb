const {tServerConf} = require('./db');

let ServerDao = {};

ServerDao.getServerConfById = async(id) => {
    return await tServerConf.findAll({
        where: {
            id: id
        }
    });
};

ServerDao.getServerConf = async(application, serverName, enableSet, setName, setArea, setGroup, curPage, pageSize) => {
    var where = {};
    application && (where.application = application);
    serverName && (where.server_name = serverName);
    if (enableSet && enableSet === 'Y') {
        where.enable_set = 'Y';
        setName && (where.set_name = setName);
        setArea && (where.set_area = setArea);
        setGroup && (where.set_group = setGroup);
    } else {
        where.enable_set = 'N';
    }
    return await tServerConf.findAll({
        where: where,
        order: [ ['application'], ['server_name']],
        limit: pageSize,
        offset: pageSize * (curPage - 1)
    });
};

ServerDao.getInactiveServerConfList = async(application, serverName, nodeName, curPage, pageSize) => {
    var where = {};
    application && (where.application = application);
    serverName && (where.server_name = serverName);
    nodeName && (where.node_name = nodeName);
    where.setting_state = 'inactive';
    return await tServerConf.findAll({
        where: where,
        order: [ ['application'], ['server_name'], ['node_name']],
        limit: pageSize,
        offset: pageSize * (curPage - 1),
    });
};


module.exports = ServerDao;