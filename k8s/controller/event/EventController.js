const logger = require('../../../logger')

const EventController = {};
const EventService = require('../../service/event/EventService')

EventController.getEvents = async (ctx) => {
    try {
        let res = await EventService.getEvents(ctx.paramsObj);
        ctx.makeResObj(200, "", res);
    } catch (e) {
        logger.error('[getEvents]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e ? e.message : e);
    }
}

EventController.getPods = async (ctx) => {
    try {
        let res = await EventService.getPods(ctx.paramsObj);
        ctx.makeResObj(200, "", res);
    } catch (e) {
        logger.error('[getPods]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e ? e.message : e);
    }
}



module.exports = EventController;
