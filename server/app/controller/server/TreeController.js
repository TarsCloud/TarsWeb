const logger = require('../../logger');
const TreeService = require('../../service/server/TreeService');
const AdminService = require('../../service/admin/AdminService');
const _ = require('lodash');
const util = require('../../tools/util');
const AuthService = require('../../service/auth/AuthService');


const TreeController = {};

TreeController.listTree = async(ctx)=> {
    try {
        ctx.makeResObj(200, '', await TreeService.getTreeNodes(ctx.uid));
    } catch (e) {
        logger.error('[listTree]', e);
        ctx.makeErrResObj();
    }
};

module.exports = TreeController;