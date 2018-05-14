/**
 * Created by denisfan on 2018/4/6.
 */
const CasServerController = require('../controller/auth/CasServerController');
const DemoController = require('../controller/demo/DemoController');
const ServerController = require('../controller/server/ServerController');
const NotifyController = require('../controller/notify/NotifyController');
const ConfigController = require('../controller/config/ConfigController');
const AdapterController = require('../controller/adapter/AdapterController');
const ExpandServerController = require('../controller/expand/ExpandServerController');
const DeployServerController = require('../controller/deploy/DeployServerController');

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
    ['get', '/getJson', DemoController.getJson, {id: 'notEmpty;object'}, ['id']],
    ['get', '/getSqlData', DemoController.getSqlData, {id: 'notEmpty;number'}],
    ['get', '/getRpcData', DemoController.getRpcData, {id: 'notEmpty;number'}],

    // 服务管理接口
    ['get', '/server', ServerController.getServerConfById, {id: 'notEmpty'}],
    ['get', '/server_exist', ServerController.serverExist, {application: 'notEmpty', server_name: 'notEmpty', node_name: 'notEmpty'}],
    ['get', '/server_list', ServerController.getServerConfList4Tree, {tree_node_id: 'notEmpty'}],
    ['get', '/inactive_server_list', ServerController.getInactiveServerConfList],
    ['get', '/get_realtime_state', ServerController.getRealtimeState, {id: 'notEmpty'}],
    ['get', '/load_server', ServerController.loadServer, {application: 'notEmpty', server_name: 'notEmpty', node_name: 'notEmpty'}],
    ['post', '/update_server', ServerController.updateServerConf, {id: 'notEmpty'},
        ['id', 'isBak', 'template_name', 'server_type', 'enable_set', 'set_name', 'set_area', 'set_group', 'async_thread_num', 'base_path', 'exe_path', 'start_script_path', 'stop_script_path', 'monitor_script_path', 'profile']],

    //notify日志接口
    ['get', '/server_notify_list', NotifyController.getServerNotifyList, {tree_node_id: 'notEmpty'}],

    //Adapter接口
    ['get', '/adapter_conf', AdapterController.getAdapterConfById, {id: 'notEmpty'}],
    ['get', '/adapter_conf_list', AdapterController.getAdapterConfListByServerConfId, {id: 'notEmpty'}],
    ['post', '/add_adapter_conf', AdapterController.addAdapterConf, {application: 'notEmpty', server_name: 'notEmpty', node_name: 'notEmpty'},
     ['application', 'server_name', 'node_name', 'thread_num', 'endpoint', 'max_connections', 'allow_ip', 'servant', 'queuecap', 'queuetimeout', 'protocol', 'handlegroup']
    ],
    ['get', '/delete_adapter_conf', AdapterController.deleteAdapterConf, {id: 'notEmpty'}],
    ['post', '/update_adapter_conf', AdapterController.updateAdapterConf, {id: 'notEmpty', servant: 'notEmpty'},
     ['id', 'thread_num', 'endpoint', 'max_connections', 'allow_ip', 'servant', 'queuecap', 'queuetimeout', 'protocol', 'handlegroup']
    ],

    //上线和扩容接口
    ['post', '/deploy_server', DeployServerController.deployServer],
    ['post', '/expand_server_preview', ExpandServerController.expandServerPreview, {application: 'notEmpty', server_name: 'notEmpty', node_name: 'notEmpty', expand_nodes: 'notEmpty'},
        ['application', 'server_name', 'set', 'node_name', 'expand_nodes', 'enable_set', 'set_name', 'set_area', 'set_group', 'copy_node_config']
    ],


    // 服务配置接口
    ['get', '/unused_config_file_list', ConfigController.getUnusedApplicationConfigFile],
    ['get', '/config_file_list', ConfigController.configFileList, {level:'number', application:'notEmpty'}],
    ['post', '/add_config_file', ConfigController.addConfigFile, {level:'number', application:'notEmpty', server_name:'notEmpty', filename:'notEmpty',config:'notEmpty'}],
    ['get', '/delete_config_file', ConfigController.deleteConfigFile,  {id: 'number'}],
    ['post', '/update_config_file', ConfigController.updateConfigFile,{id:'number',config:'notEmpty',reason:'notEmpty'}],
    ['get', '/config_file', ConfigController.configFile,  {id: 'number'}],
    ['post', '/node_config_file_list', ConfigController.nodeConfigFileList,  {application:'notEmpty', server_name:'notEmpty'}],
    ['get', '/config_file_history', ConfigController.getConfigFileHistory,  {id: 'number'}],
    ['get', '/config_file_history_list', ConfigController.configFileHistoryList,  {config_id: 'number'}],
    ['get', '/add_config_ref', ConfigController.addConfigRef,  {config_id: 'number',reference_id:'number'}],
    ['get', '/delete_config_ref', ConfigController.deleteConfigRef,  {id: 'number'}],
    ['get', '/config_ref_list', ConfigController.configRefList,  {config_id: 'number'}]
    //['get', '/merged_node_config', ConfigController.configRefList,  {id: 'notEmpty;number'}],
    //['get', '/push_config_file', ConfigController.configRefList,  {ids: 'notEmpty;string'}],
]

module.exports = {pageConf, apiConf};