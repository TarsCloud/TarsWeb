const logger = require('../../../logger');
const ServerController = require("../../controller/server/ServerController");
const CommonService = require('../../service/common/CommonService');
const ConfigService = require('../../service/config/ConfigService');

const ConfigController = {};

/**
 * 服务配置创建
 */
ConfigController.ServerConfigCreate = async (ctx) => {
    const that = module.exports

    let {
        Token = '', PodSeq = '', tree_node_id = '', ConfigName = '', ConfigContent = '', ConfigMark = ''
    } = ctx.paramsObj

    try {
        let serverData = ServerController.formatTreeNodeId(tree_node_id);
        const metadata = {
            ConfigName,
            ConfigContent,
            ConfigMark,
            ServerApp: serverData.application,
            ServerName: serverData.serverName || "",
        }

        // if (ServerId) {
        //     if (ServerId.indexOf('.') === -1) {
        //         metadata.ServerApp = ServerId
        //     } else {
        //         metadata.ServerApp = ServerId.substring(0, ServerId.indexOf('.'))
        //         metadata.ServerName = ServerId.substring(ServerId.indexOf('.') + 1, ServerId.length)
        //     }
        // }

        if (PodSeq) {
            metadata.PodSeq = PodSeq
        }

        metadata.Uid = ctx.uid;

        let result = await ConfigService.serverConfigCreate(metadata);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[ServerConfigCreate]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
};

/**
 * 服务配置列表
 * @param  {String}  Token                登录签名
 * @param  {String}  AppServer            应用名或服务名(ServerApp、ServerApp.ServerName)
 * @param  {Number}  ConfigId             配置ID
 * @param  {String}  ConfigName           配置名
 * @param  {Number}  ConfigVersion        配置版本
 * @param  {String}  ConfigContent        配置内容
 * @param  {String}  CreatePerson         创建人
 * @param  {String}  CreateTime           创建时间
 * @param  {String}  ConfigMark           创建备注
 */
ConfigController.ServerConfigSelect = async (ctx) => {
    const that = module.exports

    let {
        Token = '', tree_node_id = '', ConfigName = ''
    } = ctx.paramsObj

    let filter = {
        eq: {},
    }

    let serverData = ServerController.formatTreeNodeId(tree_node_id);

    filter.eq[CommonService.TServerAppLabel] = serverData.application;
    if (serverData.serverName) {
        filter.eq[CommonService.TServerNameLabel] = serverData.serverName;
    }

    // select configName的节点配置
    if (ConfigName !== '') {
        filter.eq[CommonService.TConfigNameLabel] = ConfigName
    }

    try {
        let result = await ConfigService.serverConfigSelect(filter);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[ServerConfigSelect]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
};
/**
 * 服务配置更新
 * @param  {String}  Token                登录签名
 * @param  {Number}  ConfigId             配置ID
 * @param  {String}  ConfigContent        配置内容
 */
ConfigController.ServerConfigUpdate = async (ctx) => {
    let {
        Token = '', ConfigId = '', ConfigMark = '', ConfigContent = ''
    } = ctx.paramsObj

    try {
        const metadata = {
            ConfigId,
            ConfigMark
        }
        let target = {
            ConfigContent,
        }

        metadata.Uid = ctx.uid;

        let result = await ConfigService.serverConfigUpdate(metadata, target);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        // console.log(e);
        logger.error('[ServerConfigUpdate]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
};
/**
 * 服务配置删除
 * @param  {String}  Token                登录签名
 * @param  {Number}  ConfigId             配置ID
 */
ConfigController.ServerConfigDelete = async (ctx) => {
        let {
            Token = '', ConfigId = ''
        } = ctx.paramsObj

        try {
            const metadata = {
                ConfigId,
            }

            let result = await ConfigService.serverConfigDelete(metadata);
            ctx.makeResObj(result.ret, result.msg, result.data);

        } catch (e) {
            logger.error('[ServerConfigDelete]', e.body ? e.body.message : e, ctx)
            ctx.makeResObj(500, e.body ? e.body.message : e);
        }
    },
    /**
     * 预览节点配置与主配置合并后的内容
     * @param  {String}  Token                登录签名
     * @param  {String}  AppServer            应用名或服务名(ServerApp、ServerApp.ServerName)
     * @param  {String}  ConfigName           配置名
     * @param  {Number}  PodSeq               节点序号
     */
    ConfigController.ServerConfigContent = async (ctx) => {
        let {
            Token = '', tree_node_id = '', ConfigName = '', PodSeq = ''
        } = ctx.paramsObj


        try {
            let serverData = ServerController.formatTreeNodeId(tree_node_id);

            // if (ServerId.indexOf('.') === -1) {
            //     ServerApp = ServerId
            // } else {
            //     ServerApp = ServerId.substring(0, ServerId.indexOf('.'))
            //     ServerName = ServerId.substring(ServerId.indexOf('.') + 1, ServerId.length)
            // }

            let metadata = {
                ServerApp: serverData.application,
                ServerName: serverData.serverName || "",
                ConfigName: ConfigName,
                PodSeq: PodSeq,
            }

            let result = await ConfigService.serverConfigContent(metadata);
            ctx.makeResObj(result.ret, result.msg, result.data);

        } catch (e) {
            logger.error('[ServerConfigContent]', e.body ? e.body.message : e, ctx)
            ctx.makeResObj(500, e.body ? e.body.message : e);
        }
    };
/**
 * 服务配置历史列表
 * @param  {String}  Token                登录签名
 * @param  {String}  AppServer            应用名或服务名(ServerApp、ServerApp.ServerName)
 * @param  {Number}  HistoryId            配置历史ID
 * @param  {Number}  ConfigId             配置ID
 * @param  {String}  ConfigName           配置名
 * @param  {Number}  ConfigVersion        配置版本
 * @param  {String}  ConfigContent        配置内容
 * @param  {String}  CreatePerson         创建人
 * @param  {String}  CreateTime           创建时间
 * @param  {String}  ConfigMark           创建备注
 */
ConfigController.ServerConfigHistroySelect = async (ctx) => {
    let {
        Token = '', ConfigId = ''
    } = ctx.paramsObj

    try {
        let result = await ConfigService.serverConfigHistroySelect(ConfigId);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[ServerConfigHistroySelect]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
};
/**
 * 服务配置历史删除
 * @param  {String}  Token                登录签名
 * @param  {Number}  HistoryId            配置历史ID
 */
ConfigController.ServerConfigHistroyDelete = async (ctx) => {
    let {
        Token = '', HistoryId = 0
    } = ctx.paramsObj

    HistoryId = Math.floor(HistoryId) || 0

    try {
        const metadata = {
            HistoryId,
        }
        let result = await ConfigService.serverConfigHistroyDelete(metadata);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[ServerConfigHistroyDelete]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
};
/**
 * 服务配置回滚
 * @param  {String}  Token                登录签名
 * @param  {Number}  HistoryId            历史ID
 */
ConfigController.ServerConfigHistoryBack = async (ctx) => {
    let {
        Token = '', HistoryId = ''
    } = ctx.paramsObj

    // HistoryId = Math.floor(HistoryId) || 0

    try {
        const metadata = {
            HistoryId,
        }

        let result = await ConfigService.serverConfigHistoryBack(metadata);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[ServerConfigHistoryBack]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

module.exports = ConfigController;