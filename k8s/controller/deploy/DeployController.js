const logger = require('../../../logger')
const CommonService = require('../../service/common/CommonService');
const DeployService = require('../../service/deploy/DeployService');

const DeployController = {};

/**
 * 服务部署创建
 */
DeployController.ServerDeployCreate = async (ctx) => {
    let {
        Token = '',
            ServerApp = '', ServerName = '', ServerMark = '', ServerK8S = {}, ServerServant = {}, ServerOption = {}
    } = ctx.paramsObj

    let Uid = ctx.uid;

    if (ServerServant) {
        for (let item in ServerServant) {
            delete ServerServant[item].HostPort
            ServerServant[item].Port = Math.floor(ServerServant[item].Port) || 0
            ServerServant[item].Threads = Math.floor(ServerServant[item].Threads) || 0
            ServerServant[item].Connections = Math.floor(ServerServant[item].Connections) || 0
            ServerServant[item].Capacity = Math.floor(ServerServant[item].Capacity) || 0
            ServerServant[item].Timeout = Math.floor(ServerServant[item].Timeout) || 0
        }
    }

    if (ServerK8S) {
        ServerK8S.Replicas = ServerK8S.Replicas ? Math.floor(ServerK8S.Replicas) : 1
    }

    try {
        const metadata = {
            ServerApp,
            ServerName,
            ServerMark,
            ServerK8S,
            ServerServant,
            ServerOption,
            Uid
        }

        let result = await DeployService.serverDeployCreate(metadata);
        ctx.makeResObj(result.ret, result.msg, result.data)
    } catch (e) {
        logger.error('[ServerDeployCreate]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}
/**
 * 服务部署列表
 * @param  {String}  Token                登录签名
 * @param  {String}  ServerApp            应用名
 * @param  {String}  ServerName           服务名
 */
DeployController.ServerDeploySelect = async (ctx) => {
    let {
        Token = '', ServerApp = '', ServerName = '', deployName = '',
    } = ctx.paramsObj
    try {

        let result = await DeployService.serverDeploySelect(ctx.uid, ServerApp, ServerName, deployName);
        ctx.makeResObj(result.ret, result.msg, result.data)

    } catch (e) {
        logger.error('[ServerDeploySelect]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

/**
 * 服务部署更新
 */
DeployController.ServerDeployUpdate = async (ctx) => {
    let {
        Token = '', DeployId = '',
            ServerK8S = {}, ServerServant = {}, ServerOption = {},
    } = ctx.paramsObj

    try {
        const metadata = {
            DeployId,
        }
        const target = {
            ServerServant,
            ServerOption,
            ServerK8S,
        }
        let result = await DeployService.serverDeployUpdate(metadata, target);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[ServerDeployUpdate]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}
/**
 * 服务部署删除
 * @param  {String}  Token                登录签名
 * @param  {Number}  DeployId             服务ID
 */
DeployController.ServerDeployDelete = async (ctx) => {
    let {
        Token = '', DeployId = ''
    } = ctx.paramsObj

    try {
        const metadata = {
            DeployId: DeployId,
        }

        let result = await DeployService.serverDeployDelete(metadata);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[ServerDeployDelete]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

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
            cloud
        } = ctx.paramsObj;

        let ServerServant = {}

        console.log(deploy);

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

        let result = await DeployService.install(deploy, ServerServant, serverK8S, serverOption, cloud);

        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[install]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
};

DeployController.exists = async (ctx) => {

    try {
        let obj = await CommonService.getServer(ctx.paramsObj.app + '.' + ctx.paramsObj.server);

        console.log(obj);

        ctx.makeResObj(200, obj ? 'server exists' : 'server not exists', obj ? true : false);

    } catch (e) {
        logger.error('[exists]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

DeployController.upgrade = async (ctx) => {

    try {

        ctx.paramsObj.deploy.uid = ctx.uid;

        let result = await DeployService.upgrade(ctx.paramsObj.deploy, ctx.paramsObj.cloud);

        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[upgrade]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}
module.exports = DeployController;