const {
    tUserInfo
} = require('../db');
const logger = require('../../logger');

var AuthDao = function(){}

//通过用户名密码获取用户信息
AuthDao.getUserInfo = async (userName, password) => {
    try{
        return await tUserInfo.findAll({
            where: {
                user_name: userName,
                password: password
            }
        });
    } catch(e){
        logger.error(e);
        throw(e);
    }
};

AuthDao.insertUserInfo = async (userName, password) => {
    try{
        return await tUserInfo.create({
            user_name: userName,
            password: password
        });
    } catch(e){
        logger.error(e);
        throw(e);
    }
};

AuthDao.getUserInfoByUserName = async(userName) =>{
    try{
        return await tUserInfo.findAll({
            where: {
                user_name: userName
            }
        });
    } catch(e){
        logger.error(e);
        throw(e);
    }
};

module.exports = AuthDao;