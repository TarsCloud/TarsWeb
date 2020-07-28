const cache = require('memory-cache');
const CronJob = require('cron').CronJob;
const LdapService = require('./LdapService');
const logger = require('../../../../app/logger');

const SetService = require('../../service/set/SetService');

const CronService = {};

let crontab = null;

/**
 * 开始定时任务
 */
CronService.start = async ()=> {

    let enableLDAP = false;

    setInterval(async function () {
        let ldapConf = await SetService.ldapConf();

        if (!enableLDAP && ldapConf.enableLDAP && ldapConf.syncAllUserSchedule) {

            if (crontab) {
                crontab.stop();
            }

            crontab = (new CronJob({
                cronTime: ldapConf.syncAllUserSchedule,
                timeZone: 'Asia/Shanghai',
                start: true,
                onTick: CronService.syncAllUserSchedule,
                runOnInit: CronService.syncAllUserSchedule
            }));
        }

        enableLDAP = ldapConf.enableLDAP;

    }, 5000);
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
    // logger.info(`********定时同步LDAP全量用户开始********`)
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
            logger.info(`cache set ldapUserList succ, length: ${userRet.length}`)
        }
    }
    logger.info(`********定时同步LDAP全量用户结束********`)
}

module.exports = CronService;
