const PatchDao = require('../../dao/PatchDao');

const PatchService = {};

PatchService.addServerPatch = async (params) => {
    return await PatchDao.insertServerPatch(params);
};

PatchService.getServerPatch = async (application, server_name, curPage, pageSize) => {
    return await PatchDao.getServerPatch(`${application}.${server_name}`, curPage, pageSize);
};

module.exports = PatchService;