

const SetService = require('../../service/set/SetService');
const LdapController = {};

LdapController.isEnableLdap = async(ctx) =>{

    try{
        let ldapConf = await SetService.ldapConf();

        ctx.cookies.set("enableLDAP", ldapConf.enableLDAP || false);
        
        ctx.makeResObj(200, '', { enableLdap: ldapConf.enableLDAP || false});
    }catch(e){
        logger.error('[LdapController.isEnableLogin]', e, ctx);
        ctx.makeErrResObj();
    }
};

module.exports = LdapController;