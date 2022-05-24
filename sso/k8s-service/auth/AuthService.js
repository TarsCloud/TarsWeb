let SetService = require('../set/SetService');
const UserService = require('../../service/user/UserService');
const logger = require('../../../logger');

const AuthService = {}

AuthService.isAdmin = async (uid) => {

    if (uid == 'admin') {
        return true;
    }

    if (await SetService.adminConf()) {
        return true;
    }

    let account = await UserService.getTAccount(uid);

    if (account && account.spec.authorization.find(item => {
            return item.role == 'admin';
        })) {
        return true;
    }

    return false;
};

//是否已经激活
AuthService.isActivated = async () => {
    return (await UserService.isActiveTAccount('admin'));
    // return !activated;
};


AuthService.addAuth = async (authList) => {

    for (let i = 0; i < authList.length; i++) {

        const auth = authList[i];

        let account = await UserService.getTAccount(auth.uid);

        if (account) {

            if (account.spec.authorization.find(item => {
                    return item.role == auth.role && item.flag == auth.flag;
                })) {
                return {};
            }
            account.spec.authorization.push({
                role: auth.role,
                flag: auth.flag,
                updateTime: new Date()
            })

            await UserService.replaceTAccount(auth.uid, account);

        } else {
            await UserService.addUserAndAuth(auth);
        }
    };

    return {}
};

AuthService.getAuthListByFlag = async (flag) => {

    let accounts = (await UserService.listTAccounts());

    let auth = [];

    accounts.forEach(account => {

        account.spec.authorization.forEach(authorization => {

            if (authorization.flag == flag) {
                auth.push(Object.assign(authorization, {
                    uid: account.spec.username
                }));
            }

        })
    });

    return auth;
}

AuthService.deleteAuth = async (flag, role) => {

    let accounts = (await UserService.listTAccounts());

    //只要是拥有flag, role的都去掉
    for (let i = 0; i < accounts.length; i++) {
        let account = accounts[i];

        let newAuthorization = account.spec.authorization.filter(item => {

            if (role) {

                if (item.flag == flag && item.role == role) {
                    return false;
                }
            } else {
                if (item.flag == flag) {
                    return false;
                }
            }
            return true;
        });

        if (newAuthorization.length != account.spec.authorization) {
            account.spec.authorization = newAuthorization;
            await UserService.replaceTAccount(account.spec.username, account);
        }
    };

};

AuthService.updateAuth = async (flag, role, uids) => {

    await AuthService.deleteAuth(flag, role);

    let uidNotExists = [];
    //给相关用户添加
    for (let i = 0; i < uids.length; i++) {
        let uid = uids[i];

        let account = await UserService.getTAccount(uid);

        if (account) {

            account.spec.authorization.push({
                role: role,
                flag: flag,
                updateTime: new Date()
            })

            await UserService.replaceTAccount(uid, account);
        } else {
            uidNotExists.push(uid);
        }
    };

    if (uidNotExists.length > 0) {
        throw ('[' + uidNotExists.join(',') + " ] users not exists");
    }
};

AuthService.getAuth = async (flag, roles, uid) => {

    let account = await UserService.getTAccount(uid);

    if (!account) {
        return null;
    }

    // console.log(account.spec.authorization);

    let data = account.spec.authorization.find(item => {
        return item.flag == flag && item.role == roles;
    })

    return data;
    //uid, role, flag
    // return await AuthDao.getAuth(flag, roles, uid);
};

AuthService.getAuthListByUid = async (uid) => {
    let account = await UserService.getTAccount(uid);

    if (!account) {
        return null;
    }

    return account.spec.authorization;
};

AuthService.getAuthList = async (flag, role, uid) => {
    let account = await UserService.getTAccount(uid);

    if (!account) {
        return null;
    }

    let data = [];

    account.spec.authorization.forEach(item => {
        if (!flag && flag != item.flag) {
            return;
        }

        if (!role && role != item.role) {
            return;
        }

        data.push(item);
    });

    return item;
};

AuthService.pageDeleteAuth = async (flag, role, uid) => {
    let account = await UserService.getTAccount(uid);

    if (!account) {
        return null;
    }

    account.spec.authorization = account.spec.authorization.filter(item => {
        if (flag != item.flag) {
            return true;
        }

        if (role != item.role) {
            return true;
        }

        return false;

    });

    return await UserService.replaceTAccount(uid, account);
}

module.exports = AuthService;