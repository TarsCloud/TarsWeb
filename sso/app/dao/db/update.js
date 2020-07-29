

const DbUpdate = { };

DbUpdate.updateLdap = async (db) => {

    let info = {
        url: "ldap://ldap.whup.com:10389",
        basedn: "ou=staff,dc=upchina,dc=com",
        reconnect: true,
        timeout: 30000,
        timeLimit: 30,
        syncAllUserSchedule: "*/5 * * * *",
        maxInCache: 600000
    };

    let data = {
        uid: 'admin',
        title: 'LDAP',
        valid: 0,
        about_cn: '开启LDAP并设置LDAP参数后, 可以连接第三方LDAP服务来完成用户登录的鉴权(admin用户除外)',
        about_en: 'After opening LDAP and setting LDAP parameters, you can connect to a third-party LDAP service to complete the user login authentication (except for admin users)',
        info: JSON.stringify(info),
        update_time: new Date(),
    };

    let ldap = await db.tSetting.findOne({ where: { title: "LDAP" } });

    if (!ldap) {
        await db.tSetting.create(data);
    }
}


DbUpdate.updateAdmin = async (db) => {

    let data = {
        uid: 'admin',
        title: 'ADMIN',
        valid: 0,
        about_cn: '启用后所有用户均为admin级别用户, 一般用于测试环境',
        about_en: 'After enabling, all users are admin level users, which are generally used in the test environment',
        info: '',
        update_time: new Date(),
    };

    let res = await db.tSetting.findOne({ where: { title: data.title } });

    if (!res) {
        await db.tSetting.create(data);
    }
}

DbUpdate.updateUser = async (db) => {

    let res = await db.tUserInfo.findOne({ where: { uid: 'admin' } });

    if (!res) {
        await db.tUserInfo.create({ uid: 'admin', password: '', update_time: new Date() });
    }
}

DbUpdate.update = async (db) => {

    await DbUpdate.updateLdap(db);

    await DbUpdate.updateAdmin(db);

    await DbUpdate.updateUser(db);
}


module.exports = DbUpdate;

