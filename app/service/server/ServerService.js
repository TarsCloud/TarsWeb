const ServerDao = require('../../dao/ServerDao');
const logger = require('../../logger');

const ServerService = {}

//通过ID获取服务信息
ServerService.getServerConfById = async(id) => {
    return await ServerDao.getServerConfById(id);
};

//通过应用，服务，节点获取获取服务信息
ServerService.getServerConf = async(application, serverName, nodeName) => {
    return await ServerDao.getServerConf({
        application: application,
        serverName: serverName,
        nodeName: nodeName
    });
};

//通过treeNodeId查询服务列表
ServerService.getServerConfList4Tree = async(treeNodeId, curPage, pageSize) => {
    let where = ServerService.formatTreeNodeId(treeNodeId);
    return await ServerDao.getServerConf({
            application: where.application || '',
            serverName: where.serverName || '',
            enableSet: where.enableSet || '',
            setName: where.setName || '',
            setArea: where.setArea || '',
            setGroup: where.setGroup || '',
            curPage: curPage || 0,
            pageSize: pageSize || 0
        }
    );
};

//树ID转换
ServerService.formatTreeNodeId = (treeNodeId) => {
    let serverConf = {enableSet: 'N'};
    treeNodeId = treeNodeId.split('.');
    treeNodeId.forEach((s)=> {
        let i = parseInt(s.substring(0, 1));
        let v = s.substring(1);
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

ServerService.updateServerConf = async(params)=>{
    return await ServerDao.updateServerConf(params);
}

module.exports = ServerService;