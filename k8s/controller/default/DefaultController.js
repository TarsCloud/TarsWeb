const logger = require('../../../logger')
const indicators = require("../../../config/hpaConfig")
const DefaultController = {};

/**
 * 目录树
 * @param  {String}  Token                登录签名
 */
DefaultController.DefaultValue = async (ctx) => {
    try {

        let defaultConfig = {
            "K8SNodeSelectorKind": [
                "AbilityPool",
                "PublicPool",
                "NodeBind",
                "LabelMatch",
            ],
            "ServerK8S": {
                "HostIpc": false,
                "HostPort": [],
                "Replicas": 0,
                "HostNetwork": false,
                "NodeSelector": {
                    "AbilityPool": {
                        "Value": []
                    }
                }
            },
            "ServerOption": {
                "AsyncThread": 3,
                "ServerProfile": "",
                "ServerTemplate": "tars.default",
                "ServerImportant": 2,
                "ServerSubType": "tars"
            },
            "ServerServantElem": {
                "Port": 10000,
                "IsTars": true,
                "IsTcp": true,
                "Threads": 3,
                "Timeout": 60000,
                "Capacity": 10000,
                "HostPort": 0,
                "Connections": 10000
            },
            "ServerTypeOptional": [
                "cpp",
                "java-war",
                "java-jar",
                "nodejs",
                "go"
            ],
            "LabelMatchOperator": [
                "In", "NotIn", "Exists", "DoesNotExist", "Gt", "Lt"
            ],
            indicators
        };

        ctx.makeResObj(200, "succ", defaultConfig)

    } catch (e) {
        logger.error('[ServerTree]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

module.exports = DefaultController;
