let AuthDao = require('../../dao/AuthDao');
let UserDao = require('../../dao/UserDao');
let SetService = require('../set/SetService');
let logger = require('../../../logger');

const AuthService = {}

AuthService.isAdmin = async(uid) => {

    if(uid == 'admin') {
        return true;
    }

    if (await SetService.adminConf()) {
        return true;
    }

    let authList = await AuthDao.getAuthList({uid: uid});

    for(let auth of authList) {
        if(auth.role == 'admin') {
            return true;
        }
    }
    return false;
};

//是否已经激活(只有一个用户, 且admin密码为空)
AuthService.isActivated = async() => {

    // logger.info("AuthService.isActivated");

    let userList = await AuthService.getUserIdList();

    // logger.info(userList);

    //超过一个用户
    if(userList.length >= 2) {
        return true;
    }

    //只有一个admin用户, 且密码是空的, 则需要初始化
    // console.log('isActivated', userList);
    if(userList.length == 0 || userList[0].password == '') {
        return false;
    }    

    return true;
};


AuthService.addAuth = async(authList) => {

    let newAuthList = [];
    authList.forEach((auth)=> {
        newAuthList.push({
            flag: auth.flag,
            role: auth.role,
            uid: auth.uid
        });
    });
    return AuthDao.insertAuth(newAuthList);
};

AuthService.deleteAuth = async(flag, role) => {
    if(role){
        await AuthDao.deleteAuth({
            flag,
            role
        });
    }else{
        await AuthDao.deleteAuth({
            flag
        });
    }
};

AuthService.updateAuth = async(flag, role, uids) => {
    let newAuthList = [];
    uids.forEach((uid)=> {
        newAuthList.push({flag: flag, role: role, uid: uid});
    });
    await AuthDao.deleteAuth({flag, role});
    return await AuthDao.insertAuth(newAuthList);
};

AuthService.getAuth = async(flag, roles, uid) => {
    return await AuthDao.getAuth(flag, roles, uid);
};

AuthService.getAuthListByUid = async(uid) => {
    return await AuthDao.getAuthList({uid: uid});
};

AuthService.getAuthListByFlag = async(flag) => {
    return await AuthDao.getAuthList({flag: flag});
};

AuthService.getAuthList = async(flag, role, uid) =>{
    let params = {};
    if (flag !== undefined && flag !== null) {
        params.flag = flag;
    }
    if (role !== undefined && role !== null) {
        params.role = role;
    }
    if (uid !== undefined && uid !== null) {
        params.uid = uid;
    }
    return await AuthDao.getAuthList(params, 'DESC');
};

AuthService.getUserIdList = async() => {
    return await UserDao.getUserIdList();
}; 

AuthService.pageDeleteAuth = async(flag, role, uid) => {
    return await AuthDao.deleteAuthById(flag, role, uid);
}

module.exports = AuthService;
