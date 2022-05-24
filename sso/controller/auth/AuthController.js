const AuthService = require('../../service/auth/AuthService');
const logger = require('../../../logger');
const util = require('../../../tools/util');
const _ = require('lodash');
const AuthController = {}

const authStruct = {
    id: '',
    flag: '',
    role: '',
    uid: ''
};

AuthController.isAdmin = async (ctx) => {
    try {
        let uid = ctx.uid;
        let admin = await AuthService.isAdmin(uid);
        ctx.makeResObj(200, '', {
            admin: admin
        });
    } catch (e) {
        logger.error('[isAdmin]', e.body ? e.body.message : e, ctx);
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
};

AuthController.addAuth = async (ctx) => {
    try {
        let auth = ctx.paramsObj.auth;
        await AuthService.addAuth(auth);
        ctx.makeResObj(200, '', {});
    } catch (e) {
        logger.error('[addAuth]', e.body ? e.body.message : e, ctx);
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
};

AuthController.deleteAuth = async (ctx) => {
    try {
        let flag = ctx.paramsObj.flag;
        await AuthService.deleteAuth(flag);
        ctx.makeResObj(200, '', {});
    } catch (e) {
        logger.error('[deleteAuth]', e.body ? e.body.message : e, ctx);
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
};

AuthController.updateAuth = async (ctx) => {
    try {
        let flag = ctx.paramsObj.flag;
        let role = ctx.paramsObj.role;
        let uids = ctx.paramsObj.uid || [];

        await AuthService.updateAuth(flag, role, uids);
        ctx.makeResObj(200, '', {});
    } catch (e) {
        logger.error('[updateAuth]', e.body ? e.body.message : e, ctx);
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
};

AuthController.getAuth = async (ctx) => {
    try {
        let uid = ctx.paramsObj.uid;
        let rst = false;

        if (await AuthService.isAdmin(uid)) {
            rst = true;
        } else {
            let flag = ctx.paramsObj.flag;
            let roles = ctx.paramsObj.role;
            roles = roles.split(';');

            // console.log("getAuth:", flag, roles, uid);

            rst = await AuthService.getAuth(flag, roles, uid);

            // console.log(rst);
        }

        ctx.makeResObj(200, '', {
            result: !!rst
        });
    } catch (e) {
        logger.error('[getAuth]', e.body ? e.body.message : e, ctx);
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
};

AuthController.getAuthListByUid = async (ctx) => {
    try {
        let uid = ctx.paramsObj.uid;
        let rst = await AuthService.getAuthListByUid(uid);

        ctx.makeResObj(200, '', util.viewFilter(rst || [], authStruct));
    } catch (e) {
        logger.error('[getAuthListByUid]', e.body ? e.body.message : e, ctx);
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
};

AuthController.getMyAuthList = async (ctx) => {
    try {
        let uid = ctx.uid;
        let rst = await AuthService.getAuthListByUid(uid);

        ctx.makeResObj(200, '', util.viewFilter(rst || [], authStruct));
    } catch (e) {
        logger.error('[getMyAuthList]', e.body ? e.body.message : e, ctx);
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
};

AuthController.getAuthListByFlag = async (ctx) => {
    try {
        let flag = ctx.paramsObj.flag;
        let rst = await AuthService.getAuthListByFlag(flag);
        ctx.makeResObj(200, '', util.viewFilter(rst || [], authStruct));
    } catch (e) {
        logger.error('[getAuthListByFlag]', e.body ? e.body.message : e, ctx);
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
};

AuthController.getAuthList = async (ctx) => {
    try {
        let flag = ctx.paramsObj.flag || null;
        let role = ctx.paramsObj.role || null;
        let uid = ctx.paramsObj.uid;
        let rst = await AuthService.getAuthList(flag, role, uid);

        ctx.makeResObj(200, '', util.viewFilter(rst || [], authStruct));
    } catch (e) {
        logger.error('[getAuthList]', e.body ? e.body.message : e, ctx);
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
};

AuthController.pageDeleteAuth = async (ctx) => {
    try {

        if (!await AuthService.isAdmin(ctx.uid)) {
            ctx.makeResObj(500, '#auth.adminNotErase#', {});
        } else {
            // let id = ctx.paramsObj.id || null;

            let flag = ctx.paramsObj.flag;
            let role = ctx.paramsObj.role;
            let uid = ctx.paramsObj.uid;

            await AuthService.pageDeleteAuth(flag, role, uid);
            ctx.makeResObj(200, '', uid);
        }

    } catch (e) {
        logger.error('[pageDeleteAuth]', e.body ? e.body.message : e, ctx);
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
};


module.exports = AuthController;