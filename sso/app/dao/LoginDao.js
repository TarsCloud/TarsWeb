const {
    tUserInfo,
    tLoginTempInfo,
} = require('./db').db_user_system;

// const logger = require('../logger');

const LoginDao = {}

//通过用户名密码获取用户信息
LoginDao.getUserInfo = async (uid, password) => {
    return await tUserInfo.findOne({
        where: {
            uid: uid,
            password: password
        }
    });
};

LoginDao.insertUserInfo = async (uid, password) => {
    return await tUserInfo.create({
        uid: uid,
        password: password
    });
};

LoginDao.getUserInfoByUid = async(uid) =>{
    return await tUserInfo.findOne({
        where: {
            uid: uid
        }
    });
};

LoginDao.getAllTgt = async() =>{
    return await tLoginTempInfo.findAll();
};

LoginDao.insertTgt = async(params)=>{
    return await tLoginTempInfo.create(params);
};

LoginDao.getTgtByTicket = async(ticket)=>{
    return await tLoginTempInfo.findOne({
        where: {
            ticket: ticket
        }
    })
};

LoginDao.deleteTgt = async(ticket) =>{
    return await tLoginTempInfo.destroy({where: {
        ticket: ticket
    }});
};

LoginDao.deleteTgtByExpireTime = async(time) =>{
    return await tLoginTempInfo.destroy({where: {
        expire_time: {
            $lt: time
        }
    }});
};

module.exports = LoginDao;