const ServerDao = require('../../dao/ServerDao');
const logger = require('../../logger');

function ServerService(id) {

}

//通过ID获取服务信息
ServerService.getServerConfById = async(id) => {
    return await ServerDao.getServerConfById(id);
};

//通过treeNodeId查询服务列表
ServerService.getServerConfList4Tree = async(treeNodeId, curPage, pageSize) => {
    var where = ServerService.formatTreeNodeId(treeNodeId);
    return await ServerDao.getServerConf(
        where.application || '',
        where.serverName || '',
        where.enableSet || '',
        where.setName || '',
        where.setArea || '',
        where.setGroup || '',
        curPage || 0,
        pageSize || 0,
    );
};

//树ID转换
ServerService.formatTreeNodeId = (treeNodeId) => {
    var serverConf = {enableSet: 'N'};
    treeNodeId = treeNodeId.split('.');
    treeNodeId.forEach((s)=> {
        var i = parseInt(s.substring(0, 1));
        var v = s.substring(1);
        switch (i) {
            case 1:
                serverConf.application = v;
                break;
            case 2:
                serverConf.setName = v;
                serverConf.enableSet = 'Y';
                break;
            case 3:
                serverConf.setArea = v;
                serverConf.enableSet = 'Y';
                break;
            case 4:
                serverConf.setGroup = v;
                serverConf.enableSet = 'Y';
                break;
            case 5:
                serverConf.serverName = v;
                break;
            default:
                break;
        }
    });
    return serverConf;
};


ServerService.getInactiveServerConfList = async(application, serverName, nodeName, curPage, pageSize) => {
    return await ServerDao.getInactiveServerConfList(
        application || '',
        serverName || '',
        nodeName || '',
        curPage || 0,
        pageSize || 0,
    );
};

module.exports = ServerService;