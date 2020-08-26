const {
    tAuth
} = require('./db').db_user_system;
// const logger = require('../logger');

const AuthDao = {}

AuthDao.insertAuth = async(authList) => {
    return await tAuth.bulkCreate(authList);
};


AuthDao.deleteAuth = async(params) => {
    return await tAuth.destroy({
        where: params
    })
};

AuthDao.getAuth = async(flag, roles, uid) => {
    return await tAuth.findOne({
        where: {
            flag: flag,
            uid: uid,
            role: roles
        }
    })
};

AuthDao.getAuthList = async(where, order) => {
    let params= {
        where: where
    }
    if(order == 'DESC'){
        params.order = [['id', 'DESC']];
    }
    return await tAuth.findAll(params);
};

AuthDao.getAuthListByUid = async(uid) => {
    return await tAuth.findAll({
        where: {
            uid: uid
        }
    });
};

AuthDao.deleteAuthById = async(id) => {
    return await tAuth.destroy({
        where: {
            id: id
        }
    })
}

AuthDao.deleteAuthByUid = async(uid) => {
    return await tAuth.destroy({
        where: {
            uid: uid
        }
    })
}
module.exports = AuthDao;