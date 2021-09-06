const UserService = require('../user/UserService');

const DbUpdate = { };

const insertData = async (data) => {
    
    let account = await UserService.getTAccount('admin');
    if (account) {
        // account = account.body;

        account.spec.extra = account.spec.extra || [];

        if (!account.spec.extra.find(i => {
            return JSON.parse(i).title == data.title
        })) {
            account.spec.extra.push(JSON.stringify(data));

            await UserService.replaceTAccount('admin', account);
        }
    }
}

const updateLdap = async () => {

    let info = {
        url: "ldap://ldap.whup.com:10389",
        basedn: "ou=starsf,dc=upchina,dc=com",
        reconnect: true,
        timeout: 30000,
        timeLimit: 30,
        syncAllUserSchedule: "*/5 * * * *",
        maxInCache: 600000
    };

    let data = {
        title: 'LDAP',
        valid: 0,
        about_cn: '开启LDAP并设置LDAP参数后, 可以连接第三方LDAP服务来完成用户登录的鉴权(admin用户除外)',
        about_en: 'After opening LDAP and setting LDAP parameters, you can connect to a third-party LDAP service to complete the user login authentication (except for admin users)',
        info: JSON.stringify(info),
        update_time: new Date(),
    };

    await insertData(data);
}


const updateAdmin = async () => {

    let data = {
        title: 'ADMIN',
        valid: 0,
        about_cn: '启用后所有用户均为admin级别用户, 一般用于测试环境',
        about_en: 'After enabling, all users are admin level users, which are generally used in the test environment',
        info: '',
        update_time: new Date(),
    };

    await insertData(data);
}

// const updateOUTTER = async () => {

//     let info = {
//         show: true,
//         registry: "tars.tarsregistry.QueryObj@tcp -h registry.tars.com -t 60000 -p 17890 -t 3000",
//         dbConf: {
//             host: 'db.tars.com', // 数据库地址
//             port: '3306', // 数据库端口
//             user: 'tars', // 用户名
//             password: 'tars2015', // 密码
//             charset: 'utf8', // 数据库编码
//             pool: {
//                 max: 10, // 连接池中最大连接数量
//                 min: 0, // 连接池中最小连接数量
//                 idle: 10000 // 如果一个线程 10 秒钟内没有被使用过的话，那么就释放线程
//             }
//         },
//     };

//     let data = {
//         title: 'OUTTER',
//         valid: 0,
//         about_cn: '开启连接k8s外部的TARS环境',
//         about_en: 'Open to connect outter tars framework outside k8s',
//         info: JSON.stringify(info),
//         update_time: new Date(),
//     };

//     await insertData(data);
// }

DbUpdate.update = async () => {

    await UserService.newTAccount('admin');
    await updateLdap();
    await updateAdmin();
    // await updateOUTTER();
}


module.exports = DbUpdate;

