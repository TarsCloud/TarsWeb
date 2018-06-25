const DemoController = require('../controller/demo/DemoController');
const PageController = require('../controller/page/PageController');
const ServerController = require('../controller/server/ServerController');
const TreeController = require('../controller/server/TreeController');
const NotifyController = require('../controller/notify/NotifyController');
const ConfigController = require('../controller/config/ConfigController');
const AdapterController = require('../controller/adapter/AdapterController');
const ExpandServerController = require('../controller/expand/ExpandServerController');
const DeployServerController = require('../controller/deploy/DeployServerController');
const TaskController = require('../controller/task/TaskController');
const PatchController = require('../controller/patch/PatchController');
const MonitorController = require('../controller/monitor/MonitorController');
const TemplateController = require('../controller/template/TemplateController');
const ResourceController = require('../controller/resource/ResourceController');

const AuthController = require('../controller/auth/AuthController');
const LoginController = require('../controller/login/LoginController');

const pageConf = [
    //首页
    ['get', '/', PageController.index],
    ['get', '/old', PageController.indexOld],
    ['get', '/pages/op_manage.htm', PageController.opManage],
    ['get', '/pages/tree', TreeController.listTree]
];

const apiConf = [
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

    ['get', '/tree', TreeController.listTree],

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
    ['get', '/auto_port', AdapterController.getAvaliablePort, {node_name: ''}],

    //上线和扩容接口
    ['post', '/deploy_server', DeployServerController.deployServer],
    ['post', '/expand_server_preview', ExpandServerController.expandServerPreview, {application: 'notEmpty', server_name: 'notEmpty', node_name: 'notEmpty', expand_nodes: 'notEmpty'},
        ['application', 'server_name', 'set', 'node_name', 'expand_nodes', 'enable_set', 'set_name', 'set_area', 'set_group', 'copy_node_config']
    ],
    ['post', '/expand_server', ExpandServerController.expandServer],
    ['get', '/cascade_select_server', ExpandServerController.selectAppServer],

    // 服务配置接口
    ['get', '/unused_config_file_list', ConfigController.getUnusedApplicationConfigFile],
    ['get', '/config_file_list', ConfigController.configFileList, {level:'number', application:'notEmpty'}],
    ['post', '/add_config_file', ConfigController.addConfigFile, {level:'number', application:'notEmpty', filename:'notEmpty',config:'notEmpty'}],
    ['get', '/delete_config_file', ConfigController.deleteConfigFile,  {id: 'number'}],
    ['post', '/update_config_file', ConfigController.updateConfigFile,{id:'number',config:'notEmpty',reason:'notEmpty'}],
    ['get', '/config_file', ConfigController.configFile,  {id: 'number'}],
    ['get', '/node_config_file_list', ConfigController.nodeConfigFileList,  {application:'notEmpty', server_name:'notEmpty'}],
    ['get', '/config_file_history', ConfigController.getConfigFileHistory,  {id: 'number'}],
    ['get', '/config_file_history_list', ConfigController.configFileHistoryList,  {config_id: 'number'}],
    ['get', '/add_config_ref', ConfigController.addConfigRef,  {config_id: 'number',reference_id:'number'}],
    ['get', '/delete_config_ref', ConfigController.deleteConfigRef,  {id: 'number'}],
    ['get', '/config_ref_list', ConfigController.configRefList,  {config_id: 'number'}],
    ['get', '/merged_node_config', ConfigController.mergedNodeConfig,  {id: 'number'}],
    ['get', '/push_config_file', ConfigController.pushConfigFile,  {ids: 'notEmpty'}],

    // 任务管理
    ['get', '/task_list', TaskController.getTasks],
    ['get', '/task', TaskController.getTask, {task_no: 'notEmpty'}],
    ['post', '/add_task', TaskController.addTask],

    // 发布包
    ['post', '/upload_patch_package', PatchController.uploadPatchPackage, {application: 'notEmpty'}],
    ['get', '/server_patch_list', PatchController.serverPatchList, {application: 'notEmpty'}],
    ['get', '/get_server_patch', PatchController.getServerPatchByTaskId, {task_id: 'notEmpty'}],
    ['get', '/get_tag_list', PatchController.getTagList, {application: 'notEmpty', server_name: 'notEmpty'}],
    ['get', '/get_tag_conf', PatchController.getCodeInfConf, {application: 'notEmpty', server_name: 'notEmpty'}],
    ['get', '/set_tag_conf', PatchController.setCodeInfConf, {path: 'notEmpty', application: 'notEmpty', server_name: 'notEmpty'}],
    ['post', '/do_compile', PatchController.doCompile],
    ['get', '/compiler_task', PatchController.compilerTask],
    ['get', '/get_compile_conf', PatchController.getCompilerConf],

    // 监控
    ['get', '/tarsstat_monitor_data', MonitorController.tarsstat],
    ['get', '/tarsproperty_monitor_data', MonitorController.tarsproperty],

    //模板管理
    ['get', '/profile_template', TemplateController.getTemplate, {profile_template: 'notEmpty'}],
    ['get', '/query_profile_template', TemplateController.getTemplateList],
    ['get', '/template_name_list', TemplateController.getTemplateNameList],
    ['post', '/add_profile_template', TemplateController.addTemplate, {template_name: 'notEmpty', parents_name: 'notEmpty', profile: 'notEmpty'}],
    ['get', '/delete_profile_template', TemplateController.deleteTemplate, {id: 'notEmpty'}],
    ['post', '/update_profile_template', TemplateController.updateTemplate, {id: 'notEmpty', template_name: 'notEmpty', parents_name: 'notEmpty', profile: 'notEmpty'}],

    //资源管理
    ['get', '/install_tars_node', ResourceController.installTarsNode, {ips: 'notEmpty'}],
    ['get', '/uninstall_tars_node', ResourceController.uninstallTarsNode, {ips: 'notEmpty'}],

    //权限管理
    ['get', '/is_enable_auth', AuthController.isEnableAuth],
    ['get', '/get_auth_list', AuthController.getAuthList],
    ['post', '/update_auth', AuthController.updateAuth, {application: 'notEmpty', server_name: 'notEmpty', operator: 'notEmpty', developer: 'notEmpty'}],
    ['get', '/has_auth', AuthController.hasAuth, {application: 'notEmpty', role: 'notEmpty'}],

    //登录管理
    ['get', '/get_login_uid', LoginController.getLoginUid],
    ['get', '/is_enable_login', LoginController.isEnableLogin]
];

module.exports = {pageConf, apiConf};