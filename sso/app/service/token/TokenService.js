let TokenDao = require('../../dao/TokenDao');
const crypto = require('crypto');

const TokenService = {}

TokenService.getTokenList = async(uid) => {
    return await TokenDao.getTokenList(uid);
}; 

// 创建加密算法
TokenService.encode = async(token) => {

    // // 如下方法使用指定的算法与密码来创建cipher对象
    // const cipher = crypto.createCipher('d', "!do2*#^@nl(k");
  
    // // 使用该对象的update方法来指定需要被加密的数据
    // let crypted = cipher.update(token, 'utf-8', 'hex');
  
    // crypted += cipher.final('hex');
 
    let crypted = crypto.createHash('sha1').update(token).digest("hex");

    return crypted;
};

  
TokenService.addToken = async(uid, expireTime) => {

    // console.log('addToken:', uid, expireTime);

    let tokenStr = await TokenService.encode(Math.random() + "-" + uid + "-" + expireTime + "-" + new Date());

    let token = {
            uid: uid,
            expire_time: expireTime,
            valid: 1,
            token: tokenStr,
            update_time: new Date()
        };
    
        
    return TokenDao.insertToken(token);
};

TokenService.getToken = async(token) => {
    await TokenDao.getToken(token);
};

TokenService.deleteToken = async(uid, ids) => {
    await TokenDao.deleteToken(uid, ids);
};

TokenService.setTokenValid = async(uid, id, valid) => {
    await TokenDao.setTokenValid(uid, id, valid);
};


module.exports = TokenService;
