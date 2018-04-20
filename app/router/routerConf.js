/**
 * Created by denisfan on 2018/4/6.
 */
const CasServerController = require('../controller/auth/CasServer');
const DemoController = require('../controller/demo/DemoController');

const pageConf = [
    //登录注册相关
    ['get', '/auth/register.html', CasServerController.registerPage],
    ['get', '/auth/login.html', CasServerController.loginPage],

    ['get', '/', DemoController.index],
]


const apiConf = [
    //登录注册相关
    ['post', '/auth/register', CasServerController.register],
    ['post', '/auth/login', CasServerController.login],
    ['get', '/auth/logout', CasServerController.logout],
    ['get', '/auth/getUserInfoByTicket', CasServerController.getUserInfoByTicket],
    ['get', '/auth/validate', CasServerController.validate],

    ['get', '/getJson', DemoController.getJson, {id: 'notEmpty;object'}],
    ['get', '/getSqlData', DemoController.getSqlData, {id: 'notEmpty;number'}],
    ['get', '/getRpcData', DemoController.getRpcData, {id: 'notEmpty;number'}]
]

module.exports = {pageConf, apiConf};