const logger = require('../../logger');
const TreeService = require('../../service/server/TreeService');
const AdminService = require('../../service/admin/AdminService');
const _ = require('lodash');
const util = require('../../tools/util');
const AuthService = require('../../service/auth/AuthService');


const TreeController = {};

TreeController.listTree = async(ctx)=> {
    try {
        console.log(await AuthService.addAuth('app1', 'server1', ['denisfan2', 'denisfan3'], ['denisfan3']));
        let authList = await AuthService.getAuthListByUid(ctx.userName);
        ctx.makeResObj(200, '', await TreeService.getTreeNodes(authList));
    } catch (e) {
        logger.error('[listTree]', e);
        ctx.makeErrResObj();
    }
};

module.exports = TreeController;