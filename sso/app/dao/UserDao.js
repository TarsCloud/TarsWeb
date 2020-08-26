const {
    tUserInfo
} = require('./db').db_user_system;

const AuthDao = require('./AuthDao');
// const logger = require('../logger');

const UserDao = {}

UserDao.getUserIdList = async() => {
    return await tUserInfo.findAll();
};

UserDao.modifyPass = async (uid, password) => {
    return await tUserInfo.update({
        password: password
    }, {
        where: {uid:uid}
    });
};

UserDao.insertUser = async(userList) => {
    return await tUserInfo.bulkCreate(userList);
};

UserDao.getUserList = async(uid) => {
    return await tUserInfo.findAll({
        where: uid
    })
};

UserDao.deleteUser = async(params) => {

    let users = await UserDao.getUserList(params);
    let uids = [];
    for(let user of users) {
        uids.push(user.uid);
    }
    // console.log('deleteUser', params, users, uids);

    await AuthDao.deleteAuthByUid(uids);

    //删除用户
    return await tUserInfo.destroy({
        where: params
    })


};

module.exports = UserDao;