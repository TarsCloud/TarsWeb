const LoginController = require('../controller/login/LoginController');
const AuthController = require('../controller/auth/AuthController');
const LocaleController = require('../controller/locale/LocaleController');

const pageConf = [
    //登录注册页面
    ['get', '/', LoginController.indexPage]
]


const apiConf = [
    //登录注册接口
    ['post', '/register', LoginController.register],
    ['post', '/login', LoginController.login],
    // ['get',  '/logout', LoginController.logout],
    ['get', '/getUidByTicket', LoginController.getUidByTicket],
    ['get', '/validate', LoginController.validate],
    
    ['get', '/getLoginUid', LoginController.getLoginUid],
    ['get', '/isEnableLogin', LoginController.isEnableLogin],

    //权限相关接口
    ['post', '/auth/addAuth', AuthController.addAuth],
    ['post', '/auth/deleteAuth', AuthController.deleteAuth],
    ['post', '/auth/updateAuth', AuthController.updateAuth],
    ['get', '/auth/getAuthListByUid', AuthController.getAuthListByUid],
    ['get', '/auth/getAuth', AuthController.getAuth],
    ['get', '/auth/getAuthListByFlag', AuthController.getAuthListByFlag],

    //权限本地页面相关接口
    ['get', '/auth/page/getAuthList', AuthController.getAuthList],
    ['post', '/auth/page/addAuth', AuthController.addAuth],
    ['post', '/auth/page/pageDeleteAuth', AuthController.pageDeleteAuth],

    //语言包接口
    ['get', '/get_locale', LocaleController.getLocale]
];

module.exports = {pageConf, apiConf};