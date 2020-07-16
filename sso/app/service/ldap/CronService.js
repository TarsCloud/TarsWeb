const cache = require('memory-cache');
const CronJob = require('cron').CronJob;
const LdapService = require('./LdapService');
const logger = require('../../../../app/logger');
// const logger = require('../../logger');
const ldapConf = require('../../../../config/webConf').ldapConf;

const CronService = {};

/**
 * 开始定时任务
 */
CronService.start = async ()=> {
    if(ldapConf.syncAllUserSchedule && ldapConf.enableLDAP) {
        (new CronJob({
            cronTime: ldapConf.syncAllUserSchedule,
            timeZone: 'Asia/Shanghai',
            start: true,
            onTick: CronService.syncAllUserSchedule,
            runOnInit: CronService.syncAllUserSchedule
        }));
    }
}

/**
 * 定时任务执行方便扩展
 */
CronService.syncAllUserSchedule = async () => {
    await CronService.run();
}

/**
 * 执行定时任务
 */
CronService.run = async ()=> {
    logger.info(`********定时同步LDAP全量用户开始********`)
    let userRet = await LdapService.searchUserInfoByFilter();
    if(userRet && userRet.iRet === 0) {
        if(userRet.userList.length > 0) {
            userRet = userRet.userList.map(item=>{
                return {
                    uid: item.uid,
                    name: item.name
                }
            });
            cache.put('ldapUserList', userRet);
            logger.info(`cache set ldapUserList succ.`)
        }
    }
    logger.info(`********定时同步LDAP全量用户结束********`)
}

module.exports = CronService;
