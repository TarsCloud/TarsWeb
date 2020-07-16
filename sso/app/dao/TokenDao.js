const {
    tToken
} = require('./db').db_user_system;

// const logger = require('../logger');

const TokenDao = {}

TokenDao.insertToken = async(token) => {
    return await tToken.create(token);
};

TokenDao.getTokenList = async(uid) => {
    return await tToken.findAll({
        where: {uid: uid}
    })
};

TokenDao.deleteToken = async(uid, ids) => {
    return await tToken.destroy({
        where: {uid: uid, id: ids} 
    })
};

TokenDao.getToken = async(token) => {
    return await tToken.findOne({
        where: {
            token: token,
        }
    })
};

TokenDao.getAllToken = async() => {
    return await tToken.findAll({
        where: {valid: 1}
    });
};

TokenDao.setTokenValid = async(uid, id, valid) => {
    return await tToken.update({
        valid: valid
    }, {
        where: {
            uid: uid,
            id: id
        }
    });
};

module.exports = TokenDao;