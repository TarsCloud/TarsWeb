const logger = require('../../../logger');

const AdapterService = require('../../service/adapter/AdapterService');

const AdapterController = {};

/**
 * 服务servant创建
 * @param  {String}  Token                登录签名
 * @param  {String}  ServerId             服务ID
 * @param  {Object}   ServerServant        servant列表
 */
AdapterController.ServerAdapterCreate = async (ctx) => {
        let {
            Token = '', ServerId = '', ServerServant = {}
        } = ctx.paramsObj

        if (ServerServant) {
            for (let item in ServerServant) {
                delete ServerServant[item].HostPort
                ServerServant[item].Port = Math.floor(ServerServant[item].Port) || (Math.round() % 20000 + 1024)
                ServerServant[item].Threads = Math.floor(ServerServant[item].Threads) || 5
                ServerServant[item].Connections = Math.floor(ServerServant[item].Connections) || 100000
                ServerServant[item].Capacity = Math.floor(ServerServant[item].Capacity) || 100000
                ServerServant[item].Timeout = Math.floor(ServerServant[item].Timeout) || 600000
            }
        }

        try {
            const metadata = {
                ServerId,
                Servant: ServerServant,
            }

            let result = await AdapterService.serverAdapterCreate(metadata);
            ctx.makeResObj(result.ret, result.msg, result.data);

        } catch (e) {
            logger.error('[ServerAdapterCreate]', e.body ? e.body.message : e, ctx)
            ctx.makeResObj(500, e.body ? e.body.message : e);
        }
    },
    /**
     * 服务servant列表
     * @param  {String}  Token                登录签名
     * @param  {String}  ServerId             服务ID
     */
    AdapterController.ServerAdapterSelect = async (ctx) => {
            let {
                Token = '', ServerId = '', isTars = '', isTcp = false
            } = ctx.paramsObj

            let limiter = null;

            isTars = isTars === 'true';
            isTcp = isTcp === 'true';

            try {

                let result = await AdapterService.serverAdapterSelect(ServerId, isTars, isTcp, limiter);
                ctx.makeResObj(result.ret, result.msg, result.data);

            } catch (e) {
                logger.error('[ServerAdapterSelect]', e.body ? e.body.message : e, ctx)
                ctx.makeResObj(500, e.body ? e.body.message : e);
            }
        },
        /**
         * 服务servant更新
         * @param  {String}  Token                登录签名
         * @param  {Number}  AdapterId            servantID
         * @param  {String}  Name                 名称
         * @param  {Number}  Port                 端口(1-30000)
         * @param  {Number}  Threads              线程数(1-30)
         * @param  {Number}  Connections          连接数(1024-100000)
         * @param  {Number}  Capacity             队列长度(100-100000)
         * @param  {Number}  Timeout              超时时间(0-100000)
         * @param  {Boolean} IsTars               是否TARS(true, false)
         * @param  {Boolean} IsTcp                是否TCP(true, false)
         */
        AdapterController.ServerAdapterUpdate = async (ctx) => {
                let {
                    Token = '', AdapterId = '', ServerServant = [], Confirmation = false
                } = ctx.paramsObj

                ServerServant.forEach(item => {
                    item.Port = Math.floor(item.Port)
                    item.Threads = Math.floor(item.Threads)
                    item.Connections = Math.floor(item.Connections)
                    item.Capacity = Math.floor(item.Capacity)
                    item.Timeout = Math.floor(item.Timeout)
                })

                try {
                    const metadata = {
                        AdapterId,
                    }
                    const target = {
                        Name: ServerServant[0].Name,
                        Threads: ServerServant[0].Threads,
                        Connections: ServerServant[0].Connections,
                        Port: ServerServant[0].Port,
                        Capacity: ServerServant[0].Capacity,
                        Timeout: ServerServant[0].Timeout,
                        IsTars: ServerServant[0].IsTars,
                        IsTcp: ServerServant[0].IsTcp,
                    }

                    let result = await AdapterService.serverAdapterUpdate(metadata, target);
                    ctx.makeResObj(result.ret, result.msg, result.data);

                } catch (e) {
                    logger.error('[ServerAdapterUpdate]', e.body ? e.body.message : e, ctx)
                    // console.log(e);
                    ctx.makeResObj(500, e.body ? e.body.message : e);
                }
            },
            /**
             * 服务servant删除
             * @param  {String}  Token                登录签名
             * @param  {Number}  AdapterId            servantID
             */
            AdapterController.ServerAdapterDelete = async (ctx) => {
                let {
                    Token = '', AdapterId = ''
                } = ctx.paramsObj

                try {
                    const metadata = {
                        AdapterId,
                    }

                    let result = await AdapterService.serverAdapterDelete(metadata);
                    ctx.makeResObj(result.ret, result.msg, result.data);

                } catch (e) {
                    logger.error('[ServerAdapterDelete]', e.body ? e.body.message : e, ctx)
                    ctx.makeResObj(500, e.body ? e.body.message : e);
                }
            }

/**
 * 服务servant获取
 * @param  {String}  Token                登录签名
 * @param  {Number}  AdapterId            servantID
 */
AdapterController.getAllAdapterConfList = async (ctx) => {
    let {
        Token = '', ServerApp = '', ServerName = ''
    } = ctx.paramsObj

    try {
        const metadata = {
            ServerApp,
            ServerName
        }

        let result = await AdapterService.getAllAdapterConfList(metadata);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[ServerAdapterDelete]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}


module.exports = AdapterController;