const logger = require('../../../logger')
const CommonService = require('../../service/common/CommonService');
const DeployService = require('../../service/deploy/DeployService');
const AuthService = require('../../service/auth/AuthService');

const DeployController = {};

/**
 * 部署
 * @param {} deploy 
 * @param {*} cloud 
 * @returns 
 */
DeployController.install = async (ctx) => {

    try {
        let {
            deploy,
            source
        } = ctx.paramsObj;

        let ServerServant = {}

        deploy.servants.forEach(obj => {
            ServerServant[obj.name] = {
                Name: obj.name,
                Port: parseInt(obj.port),
                Threads: parseInt(obj.thread),
                Connections: parseInt(obj.connection),
                Capacity: parseInt(obj.capacity),
                IsTars: obj.isTars,
                IsTcp: obj.isTcp,
                Timeout: parseInt(obj.timeout),
            }
        });

        let serverK8S = {};
        serverK8S.HostPort = [];
        deploy.hostPorts.forEach(item => {
            serverK8S.HostPort.push({
                NameRef: item.nameRef,
                Port: item.port,
            })
        });

        serverK8S.NodeSelector = deploy.nodeSelector || [];
        serverK8S.Mounts = deploy.mounts || [];
        serverK8S.HostIpc = deploy.hostIpc || false;
        serverK8S.HostNetwork = deploy.hostNetwork || false;
        serverK8S.Replicas = deploy.replicas || 1;
        serverK8S.NotStacked = deploy.notStacked || true;
        serverK8S.AbilityAffinity = deploy.abilityAffinity || 'AppOrServerPreferred';
        serverK8S.DaemonSet = deploy.daemonSet || false;
        serverK8S.LauncherType = deploy.launcherType || "background";
        serverK8S.ImagePullPolicy = deploy.imagePullPolicy || "Always";

        let serverOption = {};
        serverOption.ServerSubType = deploy.subtype || 'tars';
        serverOption.ServerTemplate = deploy.template;
        serverOption.ServerProfile = deploy.profile;
        serverOption.AsyncThread = deploy.asyncThread;

        let result = await DeployService.install(deploy, ServerServant, serverK8S, serverOption, source);

        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[install]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
};

DeployController.exists = async (ctx) => {

    try {
        let obj = await CommonService.getServer(ctx.paramsObj.app + '.' + ctx.paramsObj.server);

        // console.log(obj);

        ctx.makeResObj(200, obj ? 'server exists' : 'server not exists', obj ? true : false);

    } catch (e) {
        logger.error('[exists]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

DeployController.serverExistAndDeploy = async (ctx) => {

    try {

        let obj = await CommonService.getServer(ctx.paramsObj.app + '.' + ctx.paramsObj.server);

        let auth = await AuthService.hasOpeAuth(ctx.paramsObj.app, ctx.paramsObj.server, ctx.uid);

        let rst = {
            exists: obj ? true : false,
            auth: auth
        }

        ctx.makeResObj(200, obj ? 'server exists' : 'server not exists', rst);

    } catch (e) {
        logger.error('[exists]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

//from cloud
DeployController.installFromCloud = async (ctx) => {

    try {

        ctx.paramsObj.deploy.uid = ctx.uid;

        if (!await AuthService.hasOpeAuth(ctx.paramsObj.deploy.app, ctx.paramsObj.deploy.server, ctx.uid)) {
            ctx.makeNotAuthResObj();
            return;
        }

        await DeployController.install(ctx);
    } catch (e) {
        logger.error('[deploy]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

//from cloud
DeployController.upgradeFromCloud = async (ctx) => {

    try {
        let {
            deploy,
            source
        } = ctx.paramsObj;

        ctx.paramsObj.deploy.uid = ctx.uid;

        if (!await AuthService.hasOpeAuth(ctx.paramsObj.deploy.app, ctx.paramsObj.deploy.server, ctx.uid)) {
            ctx.makeNotAuthResObj();
            return;
        }

        let result = await DeployService.upgrade(deploy, source);

        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[deploy]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

module.exports = DeployController;