const {
    tUserInfo
} = require('./db').db_tars_web;
const logger = require('../logger');

var AuthDao = function(){}

//通过用户名密码获取用户信息
AuthDao.getUserInfo = async (userName, password) => {
    return await tUserInfo.findAll({
        where: {
            user_name: userName,
            password: password
        }
    });
};

AuthDao.insertUserInfo = async (userName, password) => {
    return await tUserInfo.create({
        user_name: userName,
        password: password
    });
};

AuthDao.getUserInfoByUserName = async(userName) =>{
    return await tUserInfo.findAll({
        where: {
            user_name: userName
        }
    });
};

module.exports = AuthDao;