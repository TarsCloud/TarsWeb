/**
 * Created by denisfan on 2018/4/6.
 */
const CasServerController = require('../controller/auth/CasServerController');
const DemoController = require('../controller/demo/DemoController');
const ConfigController = require('../controller/config/ConfigController');

const pageConf = [
    //登录注册页面
    ['get', '/auth/register.html', CasServerController.registerPage],
    ['get', '/auth/login.html', CasServerController.loginPage],

    //首页
    ['get', '/', DemoController.index],


]


const apiConf = [
    //登录注册接口
    ['post', '/auth/register', CasServerController.register],
    ['post', '/auth/login', CasServerController.login],
    ['get', '/auth/logout', CasServerController.logout],
    // ['get', '/auth/getUserInfoByTicket', CasServerController.getUserInfoByTicket],
    // ['get', '/auth/validate', CasServerController.validate],

    //Demo
    ['get', '/getJson', DemoController.getJson, {id: 'notEmpty;object'}],
    ['get', '/getSqlData', DemoController.getSqlData, {id: 'notEmpty;number'}],
    ['get', '/getRpcData', DemoController.getRpcData, {id: 'notEmpty;number'}],

    // 服务配置接口
    ['get', '/config_file_list', ConfigController.configFileList, {level:'number', application:'notEmpty'}],
    ['post', '/add_config_file', ConfigController.addConfigFile, {level:'number', application:'notEmpty', server_name:'notEmpty', filename:'notEmpty',config:'notEmpty'}],
    ['get', '/delete_config_file', ConfigController.deleteConfigFile,  {id: 'number'}],
    ['post', '/update_config_file', ConfigController.updateConfigFile,{id:'number',config:'notEmpty'}],
    ['get', '/config_file', ConfigController.configFile,  {id: 'number'}],
    ['post', '/node_config_file_list', ConfigController.nodeConfigFileList,  {application:'notEmpty', server_name:'notEmpty'}],
    ['get', '/config_file_history', ConfigController.loadConfigFileHistory,  {id: 'number'}],
    ['get', '/config_file_history_list', ConfigController.configFileHistoryList,  {config_id: 'number'}],
    ['get', '/add_config_ref', ConfigController.addConfigRef,  {config_id: 'number',reference_id:'number'}],
    ['get', '/delete_config_ref', ConfigController.deleteConfigRef,  {id: 'number'}],
    ['get', '/config_ref_list', ConfigController.configRefList,  {config_id: 'number'}]
    //['get', '/merged_node_config', ConfigController.configRefList,  {id: 'notEmpty;number'}],
    //['get', '/push_config_file', ConfigController.configRefList,  {ids: 'notEmpty;string'}],
]

module.exports = {pageConf, apiConf};