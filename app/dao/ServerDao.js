const {tServerConf} = require('./db').db_tars;
const Sequelize = require('sequelize');

const ServerDao = {};

ServerDao.getServerConfById = async(id) => {
    return await tServerConf.findOne({
        where: {
            id
        }
    });
};

ServerDao.getServerConfByName = async(application, serverName, nodeName)=> {
    return await tServerConf.findOne({
        where: {
            application: application,
            server_name: serverName,
            node_name: nodeName
        }
    });
};

ServerDao.getServerConf = async(params) => {
    let where = {};
    params.application != undefined && (where.application = params.application);
    params.serverName != undefined && (where.server_name = params.serverName);
    params.nodeName != undefined && (where.node_name = params.nodeName);
    if (params.enableSet) {
        where.enable_set = params.enableSet;
        if (params.enableSet == 'Y') {
            params.setName && (where.set_name = params.setName);
            params.setArea && (where.set_area = params.setArea);
            params.setGroup && (where.set_group = params.setGroup);
        }
    }
    let options = {
        where: where,
        order: [['application'], ['server_name']]
    };
    if (params.curPage && params.pageSize) {
        options.limit = params.pageSize;
        options.offset = params.pageSize * (params.curPage - 1);
    }
    return await tServerConf.findAll(options);
};

ServerDao.getServerConf4Tree = async(applicationList, serverNameList) => {
    let where = {$or: []};
    if (!!applicationList) {
        where.$or.push({application: applicationList});
    }
    if (!!serverNameList) {
        where.$or.push(Sequelize.where(Sequelize.fn('concat', Sequelize.col('application'), '.', Sequelize.col('server_name')), {in: serverNameList}));
    }
    if(!applicationList && !serverNameList){
        where = {};
    }
    return await tServerConf.findAll({
        attributes: [[Sequelize.literal('distinct `application`'), 'application'],
            'server_name', 'enable_set', 'set_name', 'set_area', 'set_group'
        ],
        where: where
    });
};


ServerDao.getInactiveServerConfList = async(application, serverName, nodeName, curPage, pageSize) => {
    let where = {};
    application && (where.application = application);
    serverName && (where.server_name = serverName);
    nodeName && (where.node_name = nodeName);
    where.setting_state = 'inactive';
    let options = {
        where: where,
        order: [['application'], ['server_name']]
    };
    if (curPage && pageSize) {
        options.limit = pageSize;
        options.offset = pageSize * (curPage - 1);
    }
    return await tServerConf.findAll(options);
};

ServerDao.updateServerConf = async(params) => {
    let updateOptions = {
        bak_flag: params.bak_flag,
        template_name: params.template_name,
        server_type: params.server_type,
        enable_set: params.enable_set,
        set_name: params.set_name,
        set_area: params.set_area,
        set_group: params.set_group,
        async_thread_num: params.async_thread_num,
        base_path: params.base_path,
        exe_path: params.exe_path,
        start_script_path: params.start_script_path,
        stop_script_path: params.stop_script_path,
        monitor_script_path: params.monitor_script_path,
        profile: params.profile,
        posttime: params.posttime
    };
    return await tServerConf.update(updateOptions, {where: {id: params.id}});
};

ServerDao.insertServerConf = async(params)=> {
    return await tServerConf.create(params);
};

module.exports = ServerDao;