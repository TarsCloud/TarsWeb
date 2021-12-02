const LocaleController = require('./controller/locale/LocaleController');
const PageController = require('./controller/page/PageController');
const AuthController = require('./controller/auth/AuthController');
const LoginController = require('./controller/login/LoginController');
const MonitorController = require('./controller/monitor/MonitorController');
const CallChainController = require("./controller/callchain/CallChainController");

const localeApiConf = [
    //语言包接口
    ['get', '/get_locale', LocaleController.getLocale]
];

const pageApiConf = [
    //首页
    ['get', '/', PageController.index],
    ['get', '/web_version', PageController.version],
    ['get', '/k8s_version', PageController.k8s_version],
    ['get', '/captcha', PageController.captcha],
];

const authApiConf = [
    //权限管理
    ['get', '/get_auth_list', AuthController.getAuthList],
    ['post', '/update_auth', AuthController.updateAuth, {
        application: 'notEmpty',
        server_name: 'notEmpty'
    }],
    ['get', '/has_auth', AuthController.hasAuth, {
        application: 'notEmpty',
        role: 'notEmpty'
    }],

    ['get', '/userCenter', AuthController.userCenter],

    //登录管理
    ['get', '/get_login_uid', LoginController.getLoginUid],
    ['get', '/is_enable_login', LoginController.isEnableLogin]
];

const monitorApiConf = [
    ['get', '/stat_monitor_data', MonitorController.stat],
    ['get', '/property_monitor_data', MonitorController.property]
]

const callTrainConf = [
    //调用链
    ['get', '/getAverage', CallChainController.getAverage],
    ['get', '/getAverageByFuncName', CallChainController.getAverageByFuncName],
    ['get', '/detailByTraceId', CallChainController.detailByTraceId],
    ['get', '/detailByStartEndTime', CallChainController.detailByStartEndTime],
    ['get', '/func', CallChainController.func],
    ['get', '/funcList', CallChainController.funcList],
]

module.exports = {
    pageApiConf,
    localeApiConf,
    authApiConf,
    monitorApiConf,
    callTrainConf
};

// k8sApiConf.forEach(conf => apiConf.push(conf));