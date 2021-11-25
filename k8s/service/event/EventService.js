const logger = require('../../../logger')
const webConf = require('../../../config/webConf')
const rpa = require('request-promise-any')
const EventService = {};
const TemplateService = require('../template/TemplateService')

EventService.getEvents = async (params) => {
    try {
        let esConfig = await TemplateService.getEsConfig();
        let {check, application, serverName, pod, level, startDate, endDate} = params
        let esNodes = Object.keys(esConfig.tars.es.nodes)[0].split(",")
        let url = `http://${esNodes[0]}/${esConfig.tars.es.index.kevent}/_search`

        let from = params.pageSize * (params.currPage - 1);
        let size = params.pageSize * 1
        let query = {from, size}

        if (check == "Cluster") {//集群
            query.query = {"bool": {"must_not": [{"exists": {"field": "involvedObject.namespace"}}]}}
            query.query.bool.must = [];
            if (level) {
                query.query.bool.must = [{"term": {"type.keyword": level}}]
            }
        } else if (check == "Server") {//服务级别
            query.query = {"bool": {"must": [{"exists": {"field": "involvedObject.namespace"}}]}}
            if (level) {
                query.query.bool.must.push({"term": {"type.keyword": level}});
            }
            if (application && serverName) {
                let appServer = `${application}-${serverName}`
                query.query.bool.must.push({"prefix": {"involvedObject.name.keyword": appServer.toLowerCase()}});
            } else if (application) {
                query.query.bool.must.push({"prefix": {"involvedObject.name.keyword": application}});
            }
            if (pod) {
                query.query.bool.must.push({"term": {"involvedObject.kind.keyword": "Pod"}})
                query.query.bool.must.push({"term": {"involvedObject.name.keyword": pod}},)
            }
        } else if (check == "Downtime") { //错误宕机
            query.query = {"bool": {"must": [{"term": {"reason.keyword": "BackOff"}}]}}
        }
        query.query.bool.must.push(  {
            "range":{
                "lastTimestamp":{
                    "gte": startDate,
                    "lte": endDate
                }
            }
        })
        query.sort = [{lastTimestamp: "desc"}];

        // console.log("query:" + JSON.stringify(query, null, 4));
        let rspData = await rpa({
            method: 'GET',
            uri: url,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(query)
        });
        let rsp = JSON.parse(rspData);
        if (rsp.error) {
            throw new Error(rsp.error.reason)
        }
        let total = rsp.hits.total.value
        let rows = rsp.hits.hits.map(item => {
            return item._source
        })
        return {total, rows};
    } catch (e) {
        throw new Error(e)
    }
}

EventService.getPods = async (params) => {
    try {
        let esConfig = await TemplateService.getEsConfig();
        let {application, serverName,startDate, endDate} = params
        let esNodes = esConfig.tars.es.nodes.tars_config_line_vector_value[0].split(",")
        let url = `http://${esNodes[0]}/${esConfig.tars.es.index.kevent}/_search`

        let appServer = `${application}-${serverName}`
        let query = {
            "query": {
                "bool": {
                    "must": [
                        {"term": {"involvedObject.kind.keyword": "Pod"}},
                        {
                            "prefix": {"involvedObject.name.keyword": appServer.toLowerCase()}
                        },
                        {
                            "range": {
                                "lastTimestamp": {
                                    "gte": startDate,
                                    "lte": endDate
                                }
                            }
                        }
                    ]
                }
            },
            "collapse": {
                "field": "involvedObject.name.keyword"
            }
        }
        // console.log("query:" + JSON.stringify(query, null, 4));
        let rspData = await rpa({
            method: 'GET',
            uri: url,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(query)
        });
        let rsp = JSON.parse(rspData);
        if (rsp.error) {
            throw new Error(rsp.error.reason)
        }
        return rsp.hits.hits.map(item => {
            return item._source.involvedObject.name
        })
    } catch (e) {
        throw new Error(e)
    }
}

module.exports = EventService;
