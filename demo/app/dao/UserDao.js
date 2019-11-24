const {
    tUserInfo
} = require('./db').db_user_system;
const logger = require('../logger');

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

UserDao.deleteUser = async(params) => {
    return await tUserInfo.destroy({
        where: params
    })
};

module.exports = UserDao;