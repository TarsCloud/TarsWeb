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
const _ = require('lodash');
const logger = require('../../../logger');
const rp = require('request-promise');

const {
    topologyStruct
} = require('../../../rpc/struct');
CallChainController = {};

function getTopologyPrx(k8s) {
    if (k8s == "true") {
        return require('../../../rpc/k8s').topologyPrx;
    } else {
        return require('../../../rpc').topologyPrx;
    }
}

CallChainController.getAverage = async (ctx) => {
    let date = ctx.paramsObj.nowDate;
    let server = ctx.paramsObj.label;
    let k8s = ctx.paramsObj.k8s
    try {
        let rsp = await getTopologyPrx(k8s).graphServer(date, server, 10, 10);
        let rows = [];
        for (const graph of rsp.graph) {
            let es = graph.es;
            let vs = graph.vs;
            let esObj = [];
            for (const edge of es) {
                edge.edge = `${edge.fromVertex}-${edge.toVertex}`;
                esObj.push(edge);
            }
            let row = [];
            row.push(JSON.stringify(esObj));
            row.push(server);
            row.push(server);
            row.push(server);
            //let listTrace = await topologyPrx.listTrace(date, server);
            // row.push(_.join(listTrace.ts));
            row.push("");
            row.push(JSON.stringify(vs));
            rows.push(row);
        }

        ctx.makeResObj(200, '', {
            columns: [{
                "name": "edges",
                "type": "text"
            }, {
                "name": "funcIds",
                "type": "text"
            }, {
                "name": "id",
                "type": "text"
            }, {
                "name": "label",
                "type": "text"
            }, {
                "name": "traceIds",
                "type": "text"
            }, {
                "name": "vertexes",
                "type": "text"
            }],
            rows: rows
        });
    } catch (err) {
        logger.error('[getAverage]', err, ctx);
        ctx.makeErrResObj(500, err.message);
    }
};


CallChainController.getAverageByFuncName = async (ctx) => {
    let date = ctx.paramsObj.nowDate;
    let server = ctx.paramsObj.label;
    let k8s = ctx.paramsObj.k8s

    try {
        let rsp = await getTopologyPrx(k8s).graphFunction(date, server, 10, 10);
        let rows = [];
        for (const graph of rsp.graph) {
            let es = graph.es;
            let vs = graph.vs;
            let esObj = [];
            for (const edge of es) {
                edge.edge = `${edge.fromVertex}-${edge.toVertex}`;
                esObj.push(edge);
            }
            let row = [];
            row.push(JSON.stringify(esObj));
            row.push(server);
            row.push(server);
            row.push(server);
            //let listTrace = await topologyPrx.listTrace(date, server);
            row.push("");
            row.push(JSON.stringify(vs));
            rows.push(row);
        }

        ctx.makeResObj(200, '', {
            columns: [{
                "name": "edges",
                "type": "text"
            }, {
                "name": "funcIds",
                "type": "text"
            }, {
                "name": "id",
                "type": "text"
            }, {
                "name": "label",
                "type": "text"
            }, {
                "name": "traceIds",
                "type": "text"
            }, {
                "name": "vertexes",
                "type": "text"
            }],
            rows: rows
        });
    } catch (err) {
        logger.error('[getAverage]', err, ctx);
        ctx.makeErrResObj(500, err.message);
    }
};


CallChainController.detailByTraceId = async (ctx) => {
    let date = ctx.paramsObj.nowDate;
    let traceId = ctx.paramsObj.id;
    let k8s = ctx.paramsObj.k8s

    try {
        let rsp = await getTopologyPrx(k8s).graphTrace(date, traceId);
        let es = rsp.graph.es;
        let vs = rsp.graph.vs;
        let esObj = [];
        for (const edge of es) {
            edge.edge = `${edge.fromVertex}-${edge.toVertex}`;
            esObj.push(edge);
        }
        let rows = [];

        rows.push(JSON.stringify(esObj));
        rows.push(traceId);
        rows.push(new Date().getTime());
        rows.push(JSON.stringify(vs));
        rows.push("detailId");
        ctx.makeResObj(200, '',
            {
                "columns": [
                    {
                        "name": "edges",
                        "type": "text"
                    },
                    {
                        "name": "id",
                        "type": "text"
                    },
                    {
                        "name": "timeStamp",
                        "type": "text"
                    },
                    {
                        "name": "vertexes",
                        "type": "text"
                    },
                    {
                        "name": "vertexesName",
                        "type": "text"
                    }
                ], rows: [rows]
            });
    } catch (err) {
        logger.error('[func]', err, ctx);
        ctx.makeErrResObj(500, err.message);
    }
};

CallChainController.detailByStartEndTime = async (ctx) => {
    let reg = new RegExp("-", "g")
    let date = ctx.paramsObj.nowDate.replace(reg, "");
    let beginTime = _.toInteger(ctx.paramsObj.stime);
    let endTime = _.toInteger(ctx.paramsObj.etime);
    let serverName = ctx.paramsObj.label;
    let k8s = ctx.paramsObj.k8s

    try {
        let rsp = await getTopologyPrx(k8s).listTraceSummary(date, beginTime, endTime, serverName);
        ctx.makeResObj(200, '', rsp.ts);
    } catch (err) {
        logger.error('[detail1]', err, ctx);
        ctx.makeErrResObj(500, err.message);
    }
};


CallChainController.func = async (ctx) => {
    let date = ctx.paramsObj.nowDate;
    let funcName = ctx.paramsObj.id;
    let k8s = ctx.paramsObj.k8s

    try {
        let rsp = await getTopologyPrx(k8s).graphFunction(date, funcName, 10, 10);
        let es = rsp.graph.es;
        let vs = rsp.graph.vs;
        let esObj = [];
        for (const edge of es) {
            edge.edge = `${edge.fromVertex}-${edge.toVertex}`;
            esObj.push(edge);
        }
        let rows = [];

        rows.push(JSON.stringify(esObj));
        rows.push('');
        rows.push(funcName);
        //let listTrace = await getTopologyPrx(k8s).listTrace(date, funcName);
        //rows.push(_.join(listTrace.ts));
        rows.push('');
        rows.push(JSON.stringify(vs));
        ctx.makeResObj(200, '',
            {
                columns: [
                    {
                        "name": "edges",
                        "type": "text"
                    },
                    {
                        "name": "funcNames",
                        "type": "text"
                    },
                    {
                        "name": "id",
                        "type": "text"
                    },
                    {
                        "name": "traceIds",
                        "type": "text"
                    },
                    {
                        "name": "vertexes",
                        "type": "text"
                    }
                ], rows: [rows,rows]
            });
    } catch (err) {
        logger.error('[func]', err, ctx);
        ctx.makeErrResObj(500, err.message);
    }
};
CallChainController.funcList = async (ctx) => {
    let date = ctx.paramsObj.nowDate;
    let server = ctx.paramsObj.id;
    let k8s = ctx.paramsObj.k8s

    try {
        let rsp = await getTopologyPrx(k8s).listFunction(date, server);
        let funcList = rsp.fs;
        ctx.makeResObj(200, '', {
            funcList
        });
    } catch (err) {
        logger.error('[func]', err, ctx);
        ctx.makeErrResObj(500, err.message);
    }
};

module.exports = CallChainController;