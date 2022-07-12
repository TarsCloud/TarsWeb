const logger = require('../../../logger')
const K8sService = require('../../service/k8s/K8sService');
const CommonService = require('../../service/common/CommonService')
const jsYaml = require('js-yaml')
const NodeService = require("../../service/node/NodeService");
const ServerController = require("../../controller/server/ServerController");
const K8sController = {};

/**
 * K8S列表
 */
K8sController.ServerK8SSelect = async (ctx) => {

    let {
        Token = '', page = 1, tree_node_id = '', isAll = false
    } = ctx.paramsObj
    let limiter = null;
    let serverData = ServerController.formatTreeNodeId(tree_node_id);
    try {
        let result = await K8sService.serverK8SSelect(serverData, limiter);
        ctx.makeResObj(result.ret, result.msg, result.data);
    } catch (e) {
        logger.error('[ServerK8SSelect]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

/**
 * ServerK8S更新
 */
K8sController.ServerK8SUpdate = async (ctx) => {
    let {
        Token = '', tree_node_id = '', pull, launcherType, notStacked, daemonSet, Replicas = null, NodeSelector, abilityAffinity
    } = ctx.paramsObj
    Replicas = Math.floor(Replicas) || -1
    try {
        let serverData = ServerController.formatTreeNodeId(tree_node_id);
        let target = {
            pull,
            launcherType,
            notStacked,
            daemonSet,
            Replicas,
            NodeSelector,
            abilityAffinity
        }
        let result = await K8sService.serverK8SUpdate(serverData, target);
        ctx.makeResObj(result.ret, result.msg, result.data);
    } catch (e) {
        logger.error('[ServerK8SUpdate]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

//修改k8s  Tserver 资源管理
K8sController.ServerK8SUpdateResource = async (ctx) => {
    let {
        Token = '', tree_node_id = '', limitCpu, limitMem, requestCpu, requestMem
    } = ctx.paramsObj
    try {
        let serverData = ServerController.formatTreeNodeId(tree_node_id);
        let target = {
            limitCpu, //资源管理
            limitMem,
            requestCpu,
            requestMem,
        }
        let result = await K8sService.ServerK8SUpdateResource(serverData, target);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[ServerK8SUpdateResource]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

//修改k8s  Tserver 资源管理
K8sController.ServerK8SUpdateNetwork = async (ctx) => {
    let {
        Token = '', tree_node_id = '', HostIpc, HostNetwork, showHostPort, HostPort
    } = ctx.paramsObj
    try {
        let serverData = ServerController.formatTreeNodeId(tree_node_id);

        let target = {
            HostIpc,
            HostNetwork,
            showHostPort,
            HostPort,
        }
        let result = await K8sService.ServerK8SUpdateNetwork(serverData, target);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[ServerK8SUpdateResource]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

//磁盘管理
K8sController.ServerK8SUpdateDisk = async (ctx) => {
    let {
        Token = '', tree_node_id = '', mounts
    } = ctx.paramsObj
    try {
        let serverData = ServerController.formatTreeNodeId(tree_node_id);

        let target = {
            mounts
        }
        let result = await K8sService.ServerK8SUpdateDisk(serverData, target);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[ServerK8SUpdateResource]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

K8sController.ServerK8SGenerateHostPort = async (ctx) => {
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
                for (let i = 1; i < NodeList.length - 1; i++) {
                    NodeReuqest.push(K8sService.selectAvailHostPort(NodeList[i], NodePort));
                }

                let available = true
                for (let i = 0; i < NodeReuqest.length; i++) {
                    let response = await NodeReuqest[i]
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
            let result = await NodeService.checkNode(item, NodePort);
            res.push(result)
        }
        ctx.makeResObj(200, '', res)
    } catch (e) {
        logger.error('[ServerK8SCheckHostPort]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

K8sController.DescribePod = async (ctx) => {
    try {
        let PodName = ctx.paramsObj.PodName;

        let data = await CommonService.describePod(PodName);

        if (data.body) {
            delete data.body.metadata.managedFields;
        }
        // console.log(data.body);

        ctx.makeResObj(200, '', data.body);
    } catch (e) {
        logger.error('[PodName]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

K8sController.getObject = async (ctx) => {
    try {
        let params = ctx.paramsObj
        let serverData = ServerController.formatTreeNodeId(params.tree_node_id);

        let obj = {}; //res.response.body
        if (params.plural == "tservers") {
            let res = await CommonService.getObject(params.plural, CommonService.getTServerName(serverData.application + '-' + serverData.serverName));
            obj = res.response.body
            delete obj.metadata.managedFields; //屏蔽managedFields信息
        }
        if (params.plural == "tdeploys") {
            let res = await CommonService.getObject(params.plural, CommonService.getTServerName(serverData.application + '-' + serverData.serverName));
            obj = obj.apply
        }
        if (params.plural == "tframeworkconfigs") {
            let res = await CommonService.getObject(params.plural, CommonService.TFC);
            obj = res.response.body
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
        let serverData = ServerController.formatTreeNodeId(params.tree_node_id);
        let object = jsYaml.load(params.yamlContent)
        if (params.plural == "tservers") {
            let res = await CommonService.getObject(params.plural, CommonService.getTServerName(serverData.application + '-' + serverData.serverName));
            object.metadata.managedFields = res.response.body.metadata.managedFields
            await CommonService.replaceObject(params.plural, CommonService.getTServerName(serverData.application + '-' + serverData.serverName), object)
        }
        if (params.plural == "tframeworkconfigs") {
            let res = await CommonService.getObject(params.plural, CommonService.TFC);
            object.metadata.managedFields = res.response.body.metadata.managedFields
            await CommonService.replaceObject(params.plural, CommonService.TFC, object)
        }
        if (params.plural == "tdeploys") {
            let res = await CommonService.getObject(params.plural, CommonService.getTServerName(serverData.application + '-' + serverData.serverName));
            let tdeploy = res.body
            tdeploy.apply = object
            await CommonService.replaceObject(params.plural, CommonService.getTServerName(serverData.application + '-' + serverData.serverName), tdeploy)
        }
        ctx.makeResObj(200, "", object)
    } catch (e) {
        logger.error('[ServerK8SUpdateResource]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}


module.exports = K8sController;