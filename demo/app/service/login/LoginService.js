let LoginDao = require('../../dao/LoginDao');
let TokenDao = require('../../dao/TokenDao');
let logger = require('../../logger');
let cache = require('memory-cache');
let uuidV1 = require('uuid/v1');
let sha1 = require('sha1');

const exprireTime = 7 * 24 *60 * 60 * 1000;

const LoginServer = {};

//登录操作
LoginServer.login = async(uid, password)=> {
    let userInfo = await LoginDao.getUserInfoByUid(uid);
    if (userInfo) {
        if (userInfo.password === sha1(password)) {
            let ticket = uuidV1();
            //记录本地缓存，并入库
            let expireTime = new Date(new Date().getTime() + parseInt(exprireTime));
            let tgtMap = cache.get('tgtMap');
            tgtMap && (tgtMap[ticket] = {uid: uid, expireTime: expireTime});
            LoginDao.insertTgt({
                ticket: ticket,
                uid: uid,
                expire_time: expireTime
            });
            return {ticket: ticket}
        } else {
            return {errMsg: '#login.passwordNoCorrect#'};
        }
    } else {
        return {errMsg: '#login.userNoExist#'};
    }
};

//注册操作
LoginServer.register = async(uid, password) => {
    let userInfo = await LoginDao.getUserInfoByUid(uid);
    if (userInfo) {
        return {errMsg: '#login.hasExist#'};
    } else {
        await LoginDao.insertUserInfo(uid, sha1(password));
        return {};
    }
};

//重启服务的时候，从数据库清理掉已经过期的数据
LoginServer.removeExpiresTgt = async()=> {
    return await LoginDao.deleteTgtByExpireTime(new Date());
};

//从数据库获取缓存TGT数据
LoginServer.initLoginTgtCache = async() => {
    let tgtMap = {};
    let tgts = await LoginDao.getAllTgt();
    tgts.forEach((tgt)=> {
        tgt = tgt.dataValues;
        tgtMap[tgt.ticket] = {uid: tgt.uid, expireTime: tgt.expire_time};
    });

    tgts = await TokenDao.getAllToken();
    tgts.forEach((tgt)=> {
        tgt = tgt.dataValues;
        tgtMap[tgt.ticket] = {uid: tgt.uid, expireTime: tgt.expire_time};
    });
    cache.clear();
    cache.put('tgtMap', tgtMap, 1 * 60 * 1000, ()=> {
        LoginServer.removeExpiresTgt();
        LoginServer.initLoginTgtCache();
    });
};

LoginServer.getUidByTicket = async(ticket) => {

    let tgtMap = cache.get('tgtMap') || {};
    let tgt = tgtMap[ticket];
    if (!tgt) {
        let tgtInDb = await LoginDao.getTgtByTicket(ticket);
        console.log(tgtInDb);
        if (tgtInDb) {
            tgtInDb = tgtInDb.dataValues;
            tgt = tgtMap[ticket] = {uid: tgtInDb.uid, expireTime: tgtInDb.expire_time};
        } else {
            let token = await TokenDao.getToken(ticket);
            if(token) {
                tgt = tgtMap[ticket] = {uid: token.uid, expireTime: token.expire_time}; 
            }
        }
    }
    if (tgt) {
        if (new Date().getTime() - new Date(tgt.expire_time).getTime() > 0) {
            delete tgtMap[ticket];
            LoginDao.deleteTgt(ticket);
            return null
        } else {
            return tgt.uid;
        }
    } else {
        return null;
    }
};


LoginServer.validate = async(pUid, pTicket) => {
    let uid = await LoginServer.getUidByTicket(pTicket);
    if (uid && uid === pUid) {
        return true;
    } else {
        return false;
    }
};

LoginServer.removeExpiresTgt();
LoginServer.initLoginTgtCache();


module.exports = LoginServer;