let TokenDao = require('../../dao/TokenDao');
// const crypto = require('crypto');
const ms = require('ms');
const jwt = require('jsonwebtoken')
let secret = "d2DJ2#)84nD)92%1";

const TokenService = {}

TokenService.getTokenList = async(uid) => {
    return await TokenDao.getTokenList(uid);
}; 

// // 创建加密算法
// TokenService.encode = async(token) => {

//     // // 如下方法使用指定的算法与密码来创建cipher对象
//     // const cipher = crypto.createCipher('d', "!do2*#^@nl(k");
  
//     // // 使用该对象的update方法来指定需要被加密的数据
//     // let crypted = cipher.update(token, 'utf-8', 'hex');
  
//     // crypted += cipher.final('hex');
 
//     let crypted = crypto.createHash('sha1').update(token).digest("hex");

//     return crypted;
// };


// 登陆成功，签发id_token
TokenService.signWebIDToken = function (claims, expireTime) {
    // // 使用claims签名jwt
    if (!claims.uid) {
        return null
    }
    let options = {
        expiresIn: ms(expireTime)
    }
    return jwt.sign(claims, secret, options);
}

// 用户请求，验证cookie里的token是否有效
TokenService.verifyWebIDToken = async function (id_token) {
    // 解析id_token拿到签名算法和key，并验证该id_token是否有效
    return new Promise(async (resolve, reject) => {
        jwt.verify(id_token, secret, function(err, claims) {
            if (err) {
                // verify 3种错误：
                // 0、是否过期(TokenExpiredError)；
                if (err instanceof  jwt.TokenExpiredError) {
                    resolve({code: -1, uid: null})
                    return
                }
                // 1、是否被篡改，是否Web下发(JsonWebTokenError)；
                if (err instanceof  jwt.JsonWebTokenError) {
                    resolve({code: -2, uid: null})
                    return
                }
                // 2、是否已生效(NotBeforeError)
                if (err instanceof  jwt.NotBeforeError) {
                    resolve({code: -3, uid: null})
                    return
                }
            }
            // 能解开，表示由web签发，未被篡改，未过期。用户认证通过
            resolve(claims)
        })
    })
}

TokenService.addToken = async(name, uid, expireTime) => {

    let date = Date.parse(expireTime);

    let tokenStr = await TokenService.signWebIDToken({ uid: uid }, date - (new Date()).getTime());

    let token = {
            uid: uid,
            expire_time: expireTime,
            valid: 1,
            token: tokenStr,
            update_time: new Date()
        };
    
    // console.log(token);
    
    return TokenDao.insertToken(token);
};

TokenService.getToken = async(token) => {
    await TokenDao.getToken(token);
};

TokenService.deleteToken = async(uid, ids) => {
    await TokenDao.deleteToken(uid, ids);
};

TokenService.setTokenValid = async(uid, token, valid) => {
    await TokenDao.setTokenValid(uid, token, valid);
};


module.exports = TokenService;
