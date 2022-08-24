/**
 * Tencent is pleased to support the open source community by making Tars available.
 *
 * Copyright (C) 2016THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the BSD 3-Clause License (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * https://opensource.org/licenses/BSD-3-Clause
 *
 * Unless required by applicable law or agreed to in writing, software distributed
 * under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

const logger = require('../../../logger');
const ResourceService = require('../../service/resource/ResourceService');
const AdminService = require('../../service/admin/AdminService');
const NotifyService = require('../../service/notify/NotifyService');
const TarsStream = require("@tars/stream");
const _ = require('lodash');
const path = require('path');
const webConf = require('../../../config/webConf').webConf;

var fs = require('fs');

const ResourceController = {};

ResourceController.isStrict = async (ctx) => {

    ctx.makeResObj(200, '', { strict: webConf.strict });

}

ResourceController.listTarsNode = async (ctx) => {
    let curPage = parseInt(ctx.paramsObj.curr_page) || 0;
    let pageSize = parseInt(ctx.paramsObj.page_size) || 0;
    let nodeName = ctx.paramsObj.node_name || '';
    try {
        let rst = await ResourceService.listTarsNode(nodeName, curPage, pageSize);

        let nodeNames = new TarsStream.List(TarsStream.String);
        rst.rows.forEach(row => {
            nodeNames.push(row.node_name);
        });

        try {
            //查询长连接模式
            let data = await AdminService.getNodeList(nodeNames);

            rst.rows.forEach(row => {
                row.last_heartbeat = data[row.node_name];

                if (row.last_heartbeat == '') {
                    row.present_state = 'inactive';
                }

            });
        } catch (e) {

        }

        // //获取每个节点tarsnode最新实时状态
        // rst.rows.forEach(item => {
        // 	item.last_notity = "Loading...";
        // })
        ctx.makeResObj(200, '', rst);
    } catch (e) {
        logger.error('[listTarsNode]', e, ctx);
        ctx.makeErrResObj();
    }
}

ResourceController.getLastSatet = async (ctx) => {
    try {
        let server_id = ctx.paramsObj.server_id;
        let ret = await NotifyService.getServerLastNotify(server_id);
        ctx.makeResObj(200, '', ret);
    } catch (e) {
        logger.error('[listTarsNode]', e, ctx);
        ctx.makeErrResObj();
    }
}


ResourceController.loadNodeLabel = async (ctx) => {
    let nodeName = ctx.paramsObj.node_name || '';
    try {
        let rst = await ResourceService.loadNodeLabel(nodeName);
        ctx.makeResObj(200, '', rst);
    } catch (e) {
        logger.error('[loadNodeLabel]', e, ctx);
        ctx.makeErrResObj();
    }
}

ResourceController.addNodeLabel = async (ctx) => {
    let nodeName = ctx.paramsObj.node_name || '';
    let name = ctx.paramsObj.name || '';
    let value = ctx.paramsObj.value || '';
    try {

        let rst = await ResourceService.addNodeLabel(nodeName, name, value);

        ctx.makeResObj(200, '', rst);
    } catch (e) {
        logger.error('[addNodeLabel]', e, ctx);
        ctx.makeErrResObj();
    }
}

ResourceController.deleteNodeLabel = async (ctx) => {
    let nodeName = ctx.paramsObj.node_name || '';
    let name = ctx.paramsObj.name || '';
    try {
        let rst = await ResourceService.deleteNodeLabel(nodeName, name);

        ctx.makeResObj(200, '', rst);
    } catch (e) {
        logger.error('[deleteNodeLabel]', e, ctx);
        ctx.makeErrResObj();
    }
}


ResourceController.connectTarsNode = async (ctx) => {
    try {
        let rst = await ResourceService.connectTarsNode(ctx.paramsObj);

        // console.log(rst);
        ctx.makeResObj(200, '', rst);
    } catch (e) {
        logger.error('[connectTarsNode]', e, ctx);
        ctx.makeErrResObj();
    }
};

ResourceController.installTarsNodes = async (ctx) => {
    //step: 
    //1. check install tgz package 
    //2. ssh connect 
    //3. download install package on node machine 
    //4. check params on node machine
    //5. install
    try {
        let tgzPath = path.join(__dirname, '../../../files/tarsnode.tgz');
        let exists = fs.existsSync(tgzPath);
        if (!exists) {
            ctx.makeResObj(500, '#connectNodeList.installTgzNotExists#', [{
                step: 1,
                installState: "fail"
            }]);
            return
        }

        // let ips = ctx.paramsObj.node_name;
        ctx.paramsObj.ips = _.trim(ctx.paramsObj.node_name, /;|,/).split(/[,;\n]/);
        let rst = await ResourceService.installTarsNodes(ctx.paramsObj);
        //set fail step
        rst.forEach((item) => {
            item.step = 5
            item.installState = "fail"
            if (item.msg == "#api.resource.sshFailed#") {
                item.step = 2
            } else if (item.msg == "#api.resource.downloadFail#") {
                item.step = 3
            } else if (item.msg == "#api.resource.registryAddressIsEmpty#" || item.msg == "#api.resource.machineIpIsEmpty#") {
                item.step = 4
            } else if (item.msg == "#api.resource.installSuccess#") {
                item.installState = "success"
            }
        })

        ctx.makeResObj(200, '', rst);
    } catch (e) {
        logger.error('[installTarsNode]', e, ctx);
        ctx.makeErrResObj();
    }
};

ResourceController.uninstallTarsNodes = async (ctx) => {
    try {
        let ips = ctx.paramsObj.ips;
        ips = _.trim(ips, /;|,/).split(/[,;\n]/);
        let rst = await ResourceService.uninstallTarsNodes(ips);
        ctx.makeResObj(200, '', rst);
    } catch (e) {
        logger.error('[uninstallTarsNodes]', e, ctx);
        ctx.makeErrResObj();
    }
};

ResourceController.uninstallTarsNode = async (ctx) => {
    try {
        let node_name = ctx.paramsObj.node_name;
        let rst = await ResourceService.uninstallTarsNode([node_name]);
        if (rst && rst.length > 0) {
            rst = rst[0];
        }
        ctx.makeResObj(200, '', rst);
    } catch (e) {
        logger.error('[uninstallTarsNode]', e, ctx);
        ctx.makeErrResObj();
    }
};

ResourceController.getTarsNode = async (ctx) => {
    // console.log('getTarsNode', ctx);

    let tgzPath = path.join(__dirname, '../../../files/tarsnode.tgz');
    let exists = fs.existsSync(tgzPath);
    if (!exists) {
        ctx.body = "#!/bin/bash \n echo 'not tarsnode.tgz exists'";
    }

    ctx.paramsObj.ip = ctx.paramsObj.ip || ctx.req.headers['x-forwarded-for'] || ctx.req.connection.remoteAddress || ctx.req.socket.remoteAddress || ctx.req.connection.socket.remoteAddress;

    //都是从web过来的请求, 用web host替换安装node脚本
    ctx.body = await ResourceService.getTarsNode(ctx.origin || ctx.request.origin, ctx.paramsObj);
}

ResourceController.checkTarsNode = async (ctx) => {
    let nodeName = ctx.paramsObj.node_name;
    try {
        ctx.makeResObj(200, '', await AdminService.pingNode(nodeName));
    } catch (e) {
        logger.error('[checkTarsNode]', e, ctx);
        ctx.makeResObj(200, '', false);
        // ctx.makeErrResObj();
    }
};

module.exports = ResourceController;