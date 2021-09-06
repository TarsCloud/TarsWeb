

// const CronService = require('../../../ldap/CronService')
// const LdapService = require('../../../ldap/LdapService');
const SetService = require('../../service/set/SetService');
const logger = require('../../../logger');
const LdapController = {};

LdapController.isEnableLdap = async(ctx) =>{

    try{
        // console.log('isEnableLdap');

        let ldapConf = await SetService.ldapConf();

        // console.log('isEnableLdap', ldapConf);

        ctx.cookies.set("enableLDAP", ldapConf.enableLDAP || false);
        
        ctx.makeResObj(200, '', { enableLdap: ldapConf.enableLDAP || false});
    }catch(e){
        logger.error('[LdapController.isEnableLogin]', e, ctx);
        ctx.makeErrResObj();
    }
};

// // 初始化LDAP创建
// LdapService.init();
// // 注册定时任务
// CronService.start();

module.exports = LdapController;