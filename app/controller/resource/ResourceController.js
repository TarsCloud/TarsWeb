const logger = require('../../logger');
const ResourceService = require('../../service/resource/ResourceService');
const AdminService = require('../../service/admin/AdminService');
const _ = require('lodash');
const util = require('../../tools/util');
const send = require('koa-send');


const ResourceController = {};

ResourceController.installTarsNode = async(ctx) => {
    try {
        let ips = ctx.paramsObj.ips;
        ips = _.trim(ips, /;|,/).split(';');
        let rst = await ResourceService.installTarsNodes(ips);
        ctx.makeResObj(200, '', rst);
    } catch (e) {
        logger.error('[installTarsNode]', e);
        ctx.makeErrResObj();
    }
};

ResourceController.removeTarsNode = async(ctx) => {

};


module.exports = ResourceController;