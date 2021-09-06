const logger = require('../../../logger');
const CommonService = require('../../../k8s/service/common/CommonService');
const bcrypt = require('bcrypt-nodejs');
let md5 = require('md5');

const UserService = {}

/*
{
    username: string
    extra: string[]
    authentication:
    {
        password: string
        bcryptPasswd: string
        tokens: [
            {
                name: string
                content: string
                valid: boolean
                updateTime: string
                expirationTime: string
            }
        ]
    }
    authorization:
    [
        {
            role: (admin ,operator ,developer )
            flag: string,
            updateTime:
        }
    ]
}
*/

UserService.getTAccount = async (uid) => {

    return await CommonService.getAccount(uid);
}

UserService.listTAccounts = async () => {
    return await CommonService.getAccountList();
    // return await CommonService.listObject('taccounts');
}

// console.log(UserService.listTAccounts());

UserService.createTAccount = async (account) => {
    return await CommonService.createObject('taccounts', account);
}

UserService.replaceTAccount = async (uid, account) => {

    return await CommonService.replaceObject('taccounts', md5(uid, 'asString'), account);
}

UserService.deleteTAccount = async (uid) => {
    return await CommonService.deleteObject('taccounts', md5(uid, 'asString'));
}

UserService.newTAccount = async (uid, active) => {

    let account = await UserService.getTAccount(uid);
    if (!account) {
        //创建用户
        account = {
            apiVersion: CommonService.GROUP + '/' + CommonService.VERSION,
            kind: 'TAccount',
            metadata: {
                namespace: CommonService.NAMESPACE,
                name: md5(uid, 'asString'),
            },
            spec: {
                username: uid,
                authentication: {
                    activated: active,
                    password: '123456',
                    tokens: []
                },
                authorization: [],
            },
        }

        return await UserService.createTAccount(account);
    }
    return account;
}

UserService.activeTAccount = async (uid) => {
    let account = await UserService.getTAccount(uid);
    if (account) {

        account.spec.authentication.activated = true;

        await UserService.replaceTAccount(uid, account);
    }
}

UserService.isActiveTAccount = async (uid) => {
    let account = await UserService.getTAccount(uid);
    if (account) {

        return account.spec.authentication.activated;
    }

    return false;
}

// UserService.getUserIdList = async () => {
    
//     let data = (await CommonService.listObject("taccounts")).body.items;

//     let items = [];
//     data.forEach(item => {

//         items.push({
//             uid: item.spec.username,
//             name: item.spec.username,
//             update_time: item.metadata.creationTimestamp,
//         });
//     })

//     return items;
// }; 

UserService.getUserAuthList = async () => {
    
    let data = (await CommonService.listObject("taccounts")).body.items;

    let items = [];
    data.forEach(item => {

        items.push({
            uid: item.spec.username,
            name: item.spec.username,
            update_time: item.metadata.creationTimestamp,
            authorization: item.spec.authorization,
        });
    })

    return items;
}; 


UserService.getUserPrivileges = async () => {
    
    let data = (await CommonService.listObject("taccounts")).body.items;

    let items = {};
    data.forEach(item => {
        if (item.spec.authorization) {
            items[item.spec.username] = item.spec.authorization;
        }
    })

    return items;
}; 


//注册操作
UserService.modifyPass = async(uid, password) => {

    let account = await UserService.getTAccount(uid);

    if (!account) {
        return {errMsg: 'user not exists'}
    }
    else {
        // account = account.body;

        account.spec.authentication.activated = true;
        delete account.spec.authentication.password;
        account.spec.authentication.bcryptPassword = bcrypt.hashSync(password);

        return await UserService.replaceTAccount(uid, account);
    }
};

UserService.addUser = async (userList) => {

    //创建用户
    let account = {
        apiVersion: CommonService.GROUP + '/' + CommonService.VERSION,
        kind: 'TAccount',
        metadata: {
            namespace: CommonService.NAMESPACE,
            name: '',
        },
        spec: {
            username: '',
            authentication: {
                tokens: []
            },
            authorization: []
        }
    }

    for (let i = 0; i < userList.length; i++) {

        account.metadata.name = md5(userList[i].uid, 'asString');
        account.spec.username = userList[i].uid;
        //ldap模式下, password都是一样的
        if (userList[i].password) {
            account.spec.authentication.bcryptPassword = bcrypt.hashSync(userList[i].password);
        } else {
            account.spec.authentication.password = '123456';
        }

        data = await UserService.createTAccount(account);

    }
    return {};
};


UserService.addUserAndAuth = async (user, auth) => {

    //创建用户
    let account = {
        apiVersion: CommonService.GROUP + '/' + CommonService.VERSION,
        kind: 'TAccount',
        metadata: {
            namespace: CommonService.NAMESPACE,
            name: '',
        },
        spec: {
            username: '',
            authentication: {
                tokens: []
            },
            authorization: [{
                role: auth.role,
                flag: auth.flag,
                updateTime: new Date()
            }] 
        }
    }

    account.metadata.name = md5(auth.uid, 'asString');
    account.spec.username = auth.uid;
    //ldap模式下, password都是一样的
    account.spec.authentication.password = '123456';

    data = await UserService.createTAccount(account);

    return data;
};

UserService.deleteUser = async(uids) => {

    uids.forEach(async(uid) => {
        await UserService.deleteTAccount(uid);
    });

};

module.exports = UserService;
