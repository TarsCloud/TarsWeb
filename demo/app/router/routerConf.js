const LoginController = require('../controller/login/LoginController');
const AuthController = require('../controller/auth/AuthController');
const UserController = require('../controller/user/UserController');
const TokenController = require('../controller/token/TokenController');
const LocaleController = require('../controller/locale/LocaleController');

const pageConf = [
    //登录注册页面
    ['get', '/', LoginController.indexPage]
]

const apiConf = [
    //登录注册接口
    // ['post', '/register', LoginController.register],
    ['post', '/login', LoginController.login],
    // ['get',  '/logout', LoginController.logout],
    ['get', '/getUidByTicket', LoginController.getUidByTicket],
    ['get', '/validate', LoginController.validate],
    
    ['get', '/getLoginUid', LoginController.getLoginUid],
    ['get', '/isEnableLogin', LoginController.isEnableLogin],

    ['post', '/adminModifyPass', UserController.adminModifyPass],
    ['get', '/isAdmin', AuthController.isAdmin],

    //需要登录
    ['post', '/modifyPass', UserController.modifyPass],
    ['get', '/getMyAuthList', AuthController.getMyAuthList],

    //权限相关接口(从tars-web请求过来的, localhost默认开权限)
    ['get', '/auth/isAdmin', AuthController.isAdmin],
    ['post', '/auth/addAuth', AuthController.addAuth],
    ['post', '/auth/deleteAuth', AuthController.deleteAuth],
    ['post', '/auth/updateAuth', AuthController.updateAuth],
    ['get', '/auth/getAuthListByUid', AuthController.getAuthListByUid],
    ['get', '/auth/getAuth', AuthController.getAuth],
    ['get', '/auth/getAuthListByFlag', AuthController.getAuthListByFlag],

    ['get', '/auth/getTokenList', TokenController.getTokenList],
    ['post', '/auth/addToken', TokenController.addToken],
    ['post', '/auth/deleteToken', TokenController.deleteToken],
    ['post', '/auth/setTokenValid', TokenController.setTokenValid],
    
    //登录且权限本地页面相关接口(必须是admin权限才可以操作, authMiddleware里面限制了)
    ['get', '/auth/page/getUserIdList', UserController.getUserIdList],
    ['get', '/auth/page/getAuthList', AuthController.getAuthList],
    ['post', '/auth/page/addAuth', AuthController.addAuth],
    ['post', '/auth/page/pageDeleteAuth', AuthController.pageDeleteAuth],
    ['post', '/auth/page/addUser', UserController.addUser],
    ['post', '/auth/page/pageDeleteUser', UserController.pageDeleteUser],


    //语言包接口
    ['get', '/get_locale', LocaleController.getLocale]
];

module.exports = {pageConf, apiConf};