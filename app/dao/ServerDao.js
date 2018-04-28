const {tServerConf} = require('./db').db_tars;

const ServerDao = {};

ServerDao.getServerConfById = async(id) => {
    return await tServerConf.findAll({
        where: {
            id: id
        }
    });
};

ServerDao.getServerConf = async(params) => {
    let where = {};
    params.application && (where.application = params.application);
    params.serverName && (where.server_name = params.serverName);
    params.nodeName && (where.node_name = params.nodeName);
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

module.exports = ServerDao;