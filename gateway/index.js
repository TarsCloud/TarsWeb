const GatewayController = require('./controller/GatewayController');

const gatewayApiConf = [

    //网关配置
    ['get', '/gatewayobj_list', GatewayController.getGatewayObjList],
    ['post', '/add_gatewayobj', GatewayController.addGatewayObj, {
        gatewayObj: 'notEmpty'
    }],
    ['post', '/delete_gatewayobj', GatewayController.deleteGatewayObj, {
        gatewayObj: 'notEmpty'
    }],
    ['get', '/station_list', GatewayController.getStationList, {
        gatewayObj: 'notEmpty'
    }],
    ['post', '/add_station', GatewayController.addStation, {
        f_station_id: 'notEmpty',
        f_name_cn: 'notEmpty',
        gatewayObj: 'notEmpty'
    }],
    ['post', '/update_station', GatewayController.updateStation, {
        f_id: 'notEmpty',
        f_station_id: 'notEmpty',
        f_name_cn: 'notEmpty',
        gatewayObj: 'notEmpty'
    }],
    ['post', '/delete_station', GatewayController.deleteStation, { f_id: 'notEmpty', gatewayObj: 'notEmpty' }],

    ['get', '/upstream_list', GatewayController.getUpstreamList, { gatewayObj: 'notEmpty' }],
    ['post', '/add_upstream', GatewayController.addUpstream, {
        f_upstream: 'notEmpty',
        f_addr: 'notEmpty',
        f_weight: 'notEmpty',
        f_fusing_onoff: 'notEmpty',
        gatewayObj: 'notEmpty'
    }],
    ['post', '/update_upstream', GatewayController.updateUpstream, {
        f_id: 'notEmpty',
        f_upstream: 'notEmpty',
        f_addr: 'notEmpty',
        f_weight: 'notEmpty',
        f_fusing_onoff: 'notEmpty',
        gatewayObj: 'notEmpty'
    }],
    ['post', '/delete_upstream', GatewayController.deleteUpstream, { f_id: 'notEmpty', gatewayObj: 'notEmpty' }],

    ['get', '/httprouter_list', GatewayController.getHttpRouterList, { f_station_id: 'notEmpty', gatewayObj: 'notEmpty' }],
    ['post', '/add_httprouter', GatewayController.addHttpRouter, {
        f_station_id: 'notEmpty',
        f_path_rule: 'notEmpty',
        f_proxy_pass: 'notEmpty',
        gatewayObj: 'notEmpty'
    }],
    ['post', '/update_httprouter', GatewayController.updateHttpRouter, {
        f_id: 'notEmpty',
        f_station_id: 'notEmpty',
        f_path_rule: 'notEmpty',
        f_proxy_pass: 'notEmpty',
        gatewayObj: 'notEmpty'
    }],
    ['post', '/delete_httprouter', GatewayController.deleteHttpRouter, { f_id: 'notEmpty', gatewayObj: 'notEmpty' }],

    ['get', '/bwlist', GatewayController.getBWList, {
        type: 'notEmpty',
        gatewayObj: 'notEmpty'
    }],
    ['post', '/add_bwlist', GatewayController.addBWList, {
        f_ip: 'notEmpty',
        type: 'notEmpty',
        gatewayObj: 'notEmpty'
    }],
    ['post', '/delete_bwlist', GatewayController.deleteBWList, { f_id: 'notEmpty', type: 'notEmpty', gatewayObj: 'notEmpty' }],
    ['get', '/get_flowcontrol', GatewayController.getFlowControl, { f_station_id: 'notEmpty', gatewayObj: 'notEmpty' }],
    ['post', '/upsert_flowcontrol', GatewayController.upsertFlowControl, {
        f_station_id: 'notEmpty',
        f_duration: 'notEmpty',
        f_max_flow: 'notEmpty',
        gatewayObj: 'notEmpty'
    }],
    ['post', '/loadAll_conf', GatewayController.loadAll, {gatewayObj: 'notEmpty', command: 'notEmpty'}]
];

module.exports = { gatewayApiConf };
    
// getwayApiConf.forEach(conf => apiConf.push(conf));
