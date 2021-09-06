const logger = require('../../../logger')
const K8sService = require('../../service/k8s/K8sService');
const CommonService = require('../../service/common/CommonService')
const jsYaml = require('js-yaml')
const NodeService = require("../../service/node/NodeService");
const K8sController = {};

/**
 * K8S列表
 * @param  {String}  Token                登录签名
 * @param  {String}  ServerId             配置ID
 * @param  {Object}  ServerK8S            配置
 * @param  {Number}  ServerK8S.Replicas   副本数量
 */
K8sController.ServerK8SSelect = async (ctx) => {
    const that = module.exports

    let {Token = '', page = 1, ServerId = '', isAll = false} = ctx.paramsObj
    let limiter = null;
    try {
        let result = await K8sService.serverK8SSelect(ServerId, limiter);
        ctx.makeResObj(result.ret, result.msg, result.data);
    } catch (e) {
        logger.error('[ServerK8SSelect]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

/**
 * ServerK8S更新
 * @param  {String}  Token                登录签名
 * @param  {Number}  ServerId             配置ID
 * @param  {Number}  Replicas             副本
 * @param  {String}  NodeSelector         节点
 */
K8sController.ServerK8SUpdate = async (ctx) => {
    let {Token = '', ServerId = '', Replicas = 0, NodeSelector = '',} = ctx.paramsObj
    Replicas = Math.floor(Replicas) || 0
    try {
        const metadata = {
            ServerId,
        }
        let target = {
            Replicas,
            NodeSelector,
        }
        let result = await K8sService.serverK8SUpdate(metadata, target);
        ctx.makeResObj(result.ret, result.msg, result.data);
    } catch (e) {
        logger.error('[ServerK8SUpdate]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

//修改k8s  Tserver 资源管理
K8sController.ServerK8SUpdateResource = async (ctx) => {
    let {Token = '', ServerId = '', limitCpu, limitMem, requestCpu, requestMem} = ctx.paramsObj
    try {
        const metadata = {ServerId,}
        let target = {
            limitCpu, //资源管理
            limitMem,
            requestCpu,
            requestMem,
        }
        let result = await K8sService.ServerK8SUpdateResource(metadata, target);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[ServerK8SUpdateResource]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

//修改k8s  Tserver 资源管理
K8sController.ServerK8SUpdateNetwork = async (ctx) => {
    let {Token = '', ServerId = '', HostIpc, HostNetwork, showHostPort, HostPort} = ctx.paramsObj
    try {
        const metadata = {ServerId}
        let target = {
            HostIpc,
            HostNetwork,
            showHostPort,
            HostPort,
        }
        let result = await K8sService.ServerK8SUpdateNetwork(metadata, target);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[ServerK8SUpdateResource]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

//磁盘管理
K8sController.ServerK8SUpdateDisk = async (ctx) => {
    let {Token = '', ServerId = '', mounts} = ctx.paramsObj
    try {
        const metadata = {ServerId}
        let target = {
            mounts
        }
        let result = await K8sService.ServerK8SUpdateDisk(metadata, target);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[ServerK8SUpdateResource]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

K8sController.ServerK8SGenerateHostPort = async(ctx) => {
    let NodeList = ctx.paramsObj.NodeList.split(",")
    let NodePort = ctx.paramsObj.NodePort

    // 最多重试3次
    let count = 0
    while (count < 3) {
        try {
            // 首先发出第一个请求，查找候选的空闲端口
            let result = await K8sService.selectAvailHostPort(NodeList[0], NodePort);
            // let response = await axios.get(`${rpcDomain}/hostPorts?NodeName=${NodeList[0]}&Port=${NodePort}`)
            // let result = JSON.parse(response.data.result)
            if (!result.ret == 200 && result.data.available) {
                ctx.makeResObj(500, `${result.data.port} is not available now.`, result)
                return
            }

            // 如果存在多个节点，并发请求候选节点是否符合要求
            if (NodeList.length > 1) {
                let NodeReuqest = []
                for (let i = 1; i < NodeList.length-1; i++) {
                    NodeReuqest.push(K8sService.selectAvailHostPort(NodeList[i], NodePort));
                }

                let available  = true
                for (let i = 0; i < NodeReuqest.length; i++) {
                    let response    = await NodeReuqest[i]
                    if (response.status === 500) {
                        available = false
                    } else {
                        available = response.data.available && available
                    }
                }
                if (!available) {
                    logger.info(`[rpc_ServerK8SUpdate] port:${result.data.port} is in use, try again.`)
                    count++;
                    continue
                }
            }

            ctx.makeResObj(200, '', result.data)
            return
        } catch (e) {
            logger.error('[ServerK8SGenerateHostPort]', e.body ? e.body.message : e, ctx)
            ctx.makeResObj(500, e.body ? e.body.message : e);
            return
        }
    }
    ctx.makeResObj(500, 'try 3 times and cannot find available port.')
}

K8sController.ServerK8SCheckHostPort = async (ctx) => {
    try {
        let NodePort = ctx.paramsObj.NodePort
        let NodeList = (await NodeService.nodeList()).data;
        let res = [];
        for (let item of NodeList) {
            let result = await NodeService.checkNode(item,NodePort);
            res.push(result)
        }
        ctx.makeResObj(200, '', res)
    } catch (e) {
        logger.error('[ServerK8SCheckHostPort]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

K8sController.getObject = async (ctx) => {
    try {
        let params = ctx.paramsObj
        let res = await CommonService.getObject(params.plural, CommonService.getTServerName(params.ServerId));
        let obj = res.response.body;
        if (params.plural == "tservers") {
            delete obj.metadata.managedFields; //屏蔽managedFields信息
        }
        ctx.makeResObj(200, "", jsYaml.dump(obj))
    } catch (e) {
        logger.error('[ServerK8SUpdateResource]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

K8sController.updateObject = async (ctx) => {
    try {
        let params = ctx.paramsObj
        let object = jsYaml.load(params.yamlContent)
        if (params.plural == "tservers") {
            let res = await CommonService.getObject(params.plural, CommonService.getTServerName(params.ServerId));
            object.metadata.managedFields = res.response.body.metadata.managedFields
        }
        await CommonService.replaceObject(params.plural, CommonService.getTServerName(params.ServerId), object)
        ctx.makeResObj(200, "", object)
    } catch (e) {
        logger.error('[ServerK8SUpdateResource]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}


module.exports = K8sController;
