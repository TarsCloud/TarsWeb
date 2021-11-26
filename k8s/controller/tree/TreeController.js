const logger = require('../../../logger')
const TreeService = require('../../service/tree/TreeService');

const treeNode = ({data = []}) => {
    let result = []
    if (data && data.length > 0) {
        data.forEach((item, index) => {
            let obj = {}
            if (item.BusinessName) {
                obj = {
                    id: item.BusinessName,
                    name: item.BusinessShow,
                    type: '0',
                    is_parent: true,
                    open: true,
                    pid: 'root',
                    serverType: "",
                    children: [],
                }

                if (item.App && item.App.length > 0) {
                    let tempArr = []
                    item.App.forEach(AppItem => {
                        let obj = {
                            children: [],
                            id: `${AppItem.ServerApp}`,
                            name: AppItem.ServerApp,
                            type: '1',
                            is_parent: false,
                            open: 'false',
                            serverType: "",
                            pid: item.BusinessName,
                        }
                        if (AppItem.Server && AppItem.Server.length > 0) {
                            AppItem.Server.forEach(serverItem => {
                                obj.children.push({
                                    id: `${AppItem.ServerApp}.${serverItem.ServerName}`,
                                    name: serverItem.ServerName,
                                    type: '2',
                                    is_parent: false,
                                    open: 'false',
                                    pid: AppItem.ServerApp,
                                    serverType: serverItem.serverType,
                                    children: [],
                                })
                            })
                        }
                        tempArr.push(obj)
                    })
                    obj.children = tempArr
                }

                result.push(obj)
            } else {
                if (item.App && item.App.length > 0) {
                    item.App.forEach(AppItem => {
                        if (AppItem.ServerApp) {
                            obj = {
                                id: AppItem.ServerApp,
                                name: AppItem.ServerApp,
                                type: '1',
                                is_parent: true,
                                open: true,
                                pid: 'root',
                                serverType: "",
                                children: [],
                            }
                            if (AppItem.Server && AppItem.Server.length > 0) {
                                AppItem.Server.forEach(serverItem => {
                                    obj.children.push({
                                        id: `${AppItem.ServerApp}.${serverItem.ServerName}`,
                                        name: serverItem.ServerName,
                                        type: '2',
                                        is_parent: false,
                                        open: 'false',
                                        pid: AppItem.ServerApp,
                                        serverType: serverItem.serverType,
                                        children: [],
                                    })
                                })
                            }
                            result.push(obj)
                        }
                    })
                }
            }
        })
    }
    return result
}

const TreeController = {};

/**
 * 目录树
 * @param  {String}  Token                登录签名
 */
TreeController.ServerTree = async (ctx) => {
    try {
        const {searchKey} = ctx.paramsObj
        let result = await TreeService.tree(searchKey);
        let treeData = treeNode({
            data: result.data,
        });
        ctx.makeResObj(result.ret, "succ", treeData)
    } catch (e) {
        logger.error('[ServerTree]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

module.exports = TreeController;