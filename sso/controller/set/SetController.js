const Service = require('../../service/set/SetService')
const logger = require('../../../logger')
const util = require('../../../tools/util')

const Struct = {
    id: '',
    title: '',
    info: '',
    about_cn: '',
    about_en: '',
    valid: '',
    update_time: '',
}

module.exports = {
    async getSetList(ctx) {
        try {
            const rst = await Service.getList()
            ctx.makeResObj(200, '', util.viewFilter(rst || [], Struct))
        }catch(e){
            logger.error('[getSetList]', e.body ? e.body.message:e, ctx);
            ctx.makeResObj(500, e.body ? e.body.message : e);
        }
    },
    async updateSet(ctx) {
        try{
            const { id, info } = ctx.paramsObj
            const rst = await Service.update(ctx.uid, id, info)
            ctx.makeResObj(200, '', util.viewFilter(rst || [], Struct))
        }catch(e){
            logger.error('[updateSet]', e.body ? e.body.message:e, ctx);
            ctx.makeResObj(500, e.body ? e.body.message : e);
        }
    },
    async setSetValid(ctx) {
        try{
            const { title, valid } = ctx.paramsObj
    
            const rst = await Service.setValid(title, valid)

            // const data = await Service.getKey(title);

            // console.log(title, valid, rst, data);

            if (rst && title == "LDAP") {
                ctx.cookies.set("enableLDAP", valid== 1?true:false);
            }

            ctx.makeResObj(200, '', {rst})
        }catch(e){
            logger.error('[setSetValid]', e.body ? e.body.message:e, ctx);
            ctx.makeResObj(500, e.body ? e.body.message : e);
        }
    },
}