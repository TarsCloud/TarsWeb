const Service = require('../../service/set/SetService')
const logger = require('../../../../app/logger')
const util = require('../../tools/util')

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
            logger.error('[getSetList]', e, ctx)
            ctx.makeErrResObj()
        }
    },
    async updateSet(ctx) {
        try{
            const { id, info } = ctx.paramsObj
            const rst = await Service.update(ctx.uid, id, info)
            ctx.makeResObj(200, '', util.viewFilter(rst || [], Struct))
        }catch(e){
            logger.error('[addSet]', e, ctx)
            ctx.makeErrResObj()
        }
    },
    async setSetValid(ctx) {
        try{
            const { id, valid } = ctx.paramsObj
    
            const rst = await Service.setValid(id, valid)

            const data = await Service.get(id);

            if (data.title == "LDAP") {
                ctx.cookies.set("enableLDAP", valid== 1?true:false);
            }

            ctx.makeResObj(200, '', {rst})
        }catch(e){
            logger.error('[setSetValid]', e, ctx)
            ctx.makeErrResObj()
        }
    },
}