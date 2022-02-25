const jwt = require('jsonwebtoken')
const TokenService = {}
const UserService = require('../user/UserService');
const ms = require('ms');

let secret = "d2DJ2#)84nD)92%1";

TokenService.getTokenList = async (uid) => {

    let account = await UserService.getTAccount(uid);

    if (!account) {
        return {
            errMsg: 'user not exists'
        }
    }

    let data = [];
    account.spec.authentication.tokens.forEach(token => {

        data.push({
            uid: uid,
            token: token.content,
            valid: token.valid,
            expire_time: token.expirationTime,
            update_time: token.updateTime
        })
    })

    return data;
};


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
        jwt.verify(id_token, secret, function (err, claims) {
            if (err) {
                // verify 3种错误：
                // 0、是否过期(TokenExpiredError)；
                if (err instanceof jwt.TokenExpiredError) {
                    resolve({
                        code: -1,
                        uid: null
                    })
                    return
                }
                // 1、是否被篡改，是否Web下发(JsonWebTokenError)；
                if (err instanceof jwt.JsonWebTokenError) {
                    resolve({
                        code: -2,
                        uid: null
                    })
                    return
                }
                // 2、是否已生效(NotBeforeError)
                if (err instanceof jwt.NotBeforeError) {
                    resolve({
                        code: -3,
                        uid: null
                    })
                    return
                }
            }
            // 能解开，表示由web签发，未被篡改，未过期。用户认证通过
            resolve(claims)
        })
    })
}

TokenService.addToken = async (name, uid, expireTime) => {

    let date = Date.parse(expireTime + ":00");

    let tokenStr = await TokenService.signWebIDToken({
        uid: uid
    }, date - (new Date()).getTime());

    let account = await UserService.getTAccount(uid);

    if (!account) {
        return {
            errMsg: 'user not exists'
        }
    }

    let token = {
        name: name || 'token',
        content: tokenStr,
        updateTime: new Date(),
        expirationTime: new Date(date),
        valid: true,
    }

    account.spec.authentication.tokens.push(token);

    return await UserService.replaceTAccount(uid, account);
};


TokenService.deleteToken = async (uid, tokens) => {

    let account = await UserService.getTAccount(uid);

    if (!account) {
        return {
            errMsg: 'user not exists'
        }
    }

    if (tokens && tokens.length > 0) {
        account.spec.authentication.tokens = account.spec.authentication.tokens.filter(item => {

            return !tokens.find(i => {
                return i == item.content;
            });
        });
    }

    return await UserService.replaceTAccount(uid, account);
};

TokenService.setTokenValid = async (uid, token, valid) => {

    let account = await UserService.getTAccount(uid);

    if (!account) {
        return {
            errMsg: 'user not exists'
        }
    }

    account.spec.authentication.tokens.forEach(item => {

        if (item.content == token) {
            item.valid = (1 == valid);
        }
    });

    return await UserService.replaceTAccount(uid, account);
};


module.exports = TokenService;