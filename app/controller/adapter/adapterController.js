const logger = require('../../logger');
const AdapterService = require('../../service/adapter/AdapterService');
const _ = require('lodash');
const util = require('../../tools/util');

const adapterConfStruct = {
    id: '',
    application: '',
    server_name: '',
    node_name: '',
    adapter_name: '',
    thread_num: '',
    endpoint: '',
    max_connections: '',
    allow_ip: '',
    servant: '',
    queuecap: '',
    queuetimeout: '',
    posttime: {formatter: util.formatTimeStamp},
    protocol: '',
    handlegroup: ''
};

const AdapterController = {};

AdapterController.getAdapterConfById = async(ctx) => {
    let id = ctx.paramsObj.id;
    try {
        var rst = await AdapterService.getAdapterConfById(id);
        if (!_.isEmpty(rst)) {
            ctx.makeResObj(200, '', util.viewFilter(rst, adapterConfStruct));
        } else {
            logger.error('[getAdapterConfById]', '未查询到id=' + id + '相应的Adapter');
            ctx.makeErrResObj();
        }
    } catch (e) {
        logger.error('[getAdapterConfById]', e);
        ctx.makeErrResObj();
    }
};

AdapterController.getAdapterConfListByServerConfId = async(ctx) => {
    let id = ctx.paramsObj.id;
    try {
        let rst = await AdapterService.getAdapterConfList(id);
        ctx.makeResObj(200, '', util.viewFilter(rst, adapterConfStruct));
    } catch (e) {
        logger.error('[getAdapterConfListByServerConfId]', e);
        ctx.makeErrResObj();
    }
};

AdapterController.addAdapterConf = async(ctx) => {
    let addAdapter = ctx.paramsObj;
    try {
        addAdapter.adapter_name = addAdapter.servant + 'Adapter';
        addAdapter.posttime = new Date();
        let rst = await AdapterService.addAdapterConf(addAdapter);
        ctx.makeResObj(200, '', util.viewFilter(rst, adapterConfStruct));
    } catch (e) {
        logger.error('[addAdapterConf]', e);
        ctx.makeErrResObj();
    }
};

AdapterController.deleteAdapterConf = async(ctx) => {
    let id = ctx.paramsObj.id;
    try {
        await AdapterService.deleteAdapterConf(id);
        ctx.makeResObj(200, '', id);
    } catch (e) {
        logger.error('[addAdapterConf]', e);
        ctx.makeErrResObj();
    }
};


AdapterController.updateAdapterConf = async(ctx) => {
    let updateAdapter = ctx.paramsObj;
    try {
        updateAdapter.adapter_name = updateAdapter.servant + 'Adapter';
        updateAdapter.posttime = new Date();
        await AdapterService.updateAdapterConf(updateAdapter);
        let rst = await AdapterService.getAdapterConfById(updateAdapter.id);
        if (!_.isEmpty(rst)) {
            ctx.makeResObj(200, '', util.viewFilter(rst, adapterConfStruct));
        } else {
            logger.error('[getAdapterConfById]', '未查询到id=' + updateAdapter.id + '相应的Adapter');
            ctx.makeErrResObj();
        }
    } catch (e) {
        logger.error('[updateAdapterConf]', e);
        ctx.makeErrResObj();
    }
};


module.exports = AdapterController;