

const ldapConf = require('../../../../config/webConf').ldapConf;
const LdapController = {};

LdapController.isEnableLdap = async(ctx) =>{
    try{
        ctx.makeResObj(200, '', {enableLdap: ldapConf.enableLDAP || false});
    }catch(e){
        logger.error('[LdapController.isEnableLogin]', e, ctx);
        ctx.makeErrResObj();
    }
};

module.exports = LdapController;