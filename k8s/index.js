const DefaultController = require('./controller/default/DefaultController');
const AdapterController = require('./controller/adapter/AdapterController');
const AffinityController = require('./controller/affinity/AffinityController');
const ApplicationController = require('./controller/application/ApplicationController');
const ApprovalController = require('./controller/approval/ApprovalController');
const BusinessController = require('./controller/business/BusinessController');
const ConfigController = require('./controller/config/ConfigController');
const K8sController = require('./controller/k8s/K8sController');
const DeployController = require('./controller/deploy/DeployController');
const NodeController = require('./controller/node/NodeController');
const PatchController = require('./controller/patch/PatchController');
const PodController = require('./controller/pod/PodController');
const ServerController = require('./controller/server/ServerController');
const TemplateController = require('./controller/template/TemplateController');
const TreeController = require('./controller/tree/TreeController');
const NotifyController = require('./controller/notify/NotifyController');
const ImageController = require('./controller/image/ImageController');
const HPAController = require('./controller/hpa/HPAController');
const EventController = require('./controller/event/EventController');
const FrameworkController = require("./controller/framework/FrameworkController")

const k8sApiConf = [
    // 目录树接口
    ['get', '/tree', TreeController.ServerTree],

    // 默认参数
    ['get', '/default', DefaultController.DefaultValue],

    ['get', '/server_search', PodController.PodSearch],

    // 服务状态
    ['get', '/server_notify_list', NotifyController.NotifySelect, {
        ServerId: 'notEmpty'
    }],

    // 应用管理 ( 创建、列表、更新、删除 )
    ['post', '/application_create', ApplicationController.ApplicationCreate],
    ['get', '/application_select', ApplicationController.ApplicationSelect],
    ['post', '/application_update', ApplicationController.ApplicationUpdate, {
        ServerApp: 'notEmpty'
    }],
    ['get', '/application_delete', ApplicationController.ApplicationDelete, {
        ServerApp: 'notEmpty'
    }],

    // 业务管理 ( 创建、列表、更新、删除 )
    ['post', '/business_create', BusinessController.BusinessCreate],
    ['get', '/business_select', BusinessController.BusinessSelect],
    ['post', '/business_update', BusinessController.BusinessUpdate, {
        BusinessName: 'notEmpty'
    }],
    ['get', '/business_delete', BusinessController.BusinessDelete, {
        BusinessName: 'notEmpty'
    }],
    ['post', '/business_add_app', BusinessController.BusinessAddApp, {
        BusinessName: 'notEmpty'
    }],
    ['post', '/business_list_app', BusinessController.BusinessListByApp, {
        BusinessNames: 'notEmpty'
    }],

    // 模版管理 ( 创建、列表、更新、删除 )
    ['post', '/template_create', TemplateController.TemplateCreate],
    ['get', '/template_select', TemplateController.TemplateSelect],
    ['post', '/template_update', TemplateController.TemplateUpdate, {
        TemplateId: 'notEmpty'
    }],
    ['get', '/template_delete', TemplateController.TemplateDelete, {
        TemplateId: 'notEmpty'
    }],

    // 服务部署 ( 创建、创建列表、删除、审批、审批列表 )
    ['post', '/deploy_create', DeployController.ServerDeployCreate, {
        ServerApp: 'notEmpty',
        ServerName: 'notEmpty'
    }],
    ['get', '/deploy_select', DeployController.ServerDeploySelect],
    ['post', '/deploy_update', DeployController.ServerDeployUpdate, {
        DeployId: 'notEmpty'
    }],
    ['get', '/deploy_delete', DeployController.ServerDeployDelete, {
        DeployId: 'notEmpty'
    }],
    ['post', '/approval_create', ApprovalController.ServerApprovalCreate, {
        ServerApp: 'notEmpty',
        ServerName: 'notEmpty'
    }],
    ['get', '/approval_select', ApprovalController.ServerApprovalSelect],

    ['get', '/exists', DeployController.exists, {
        app: 'notEmpty',
        server: 'notEmpty',
    }],
    ['post', '/install', DeployController.install, {
        deploy: 'notEmpty',
    }],
    ['post', '/upgrade', DeployController.upgrade, {
        deploy: 'notEmpty',
        cloud: 'notEmpty',
    }],

    // 服务配置文件 ( 创建、列表、更新、删除 )
    ['post', '/server_config_create', ConfigController.ServerConfigCreate],
    ['get', '/server_config_select', ConfigController.ServerConfigSelect, {
        ServerId: 'notEmpty'
    }],
    ['post', '/server_config_update', ConfigController.ServerConfigUpdate, {
        ConfigId: 'notEmpty'
    }],
    ['get', '/server_config_delete', ConfigController.ServerConfigDelete, {
        ConfigId: 'notEmpty'
    }],
    ['get', '/merged_node_config', ConfigController.ServerConfigContent, {
        ServerId: 'notEmpty',
        ConfigName: 'notEmpty'
    }],

    // 服务配置文件历史记录 ( 列表、删除 )
    ['get', '/server_config_history_select', ConfigController.ServerConfigHistroySelect, {
        ConfigId: 'notEmpty'
    }],
    ['get', '/server_config_history_delete', ConfigController.ServerConfigHistroyDelete, {
        HistoryId: 'notEmpty'
    }],
    ['post', '/server_config_history_back', ConfigController.ServerConfigHistoryBack, {
        HistoryId: 'notEmpty'
    }],

    // 服务管理 ( pod列表、pod历史列表、服务列表、服务更新、状态(重启、停止)、编辑、更新 )
    ['get', '/pod_list', PodController.PodAliveSelect, {
        ServerId: 'notEmpty'
    }],
    ['get', '/pod_history_list', PodController.PodPerishedSelect, {
        ServerId: 'notEmpty'
    }],
    ['get', '/delete_pod', PodController.deletePod, {
        PodName: 'notEmpty'
    }],

    ['get', '/server_list', ServerController.ServerSelect],
    ['post', '/server_update', ServerController.ServerUpdate, {
        ServerId: 'notEmpty'
    }],
    ['post', '/server_undeploy', ServerController.ServerUndeploy, {
        ServerId: 'notEmpty'
    }],
    ['get', '/server_option_select', ServerController.ServerOptionSelect, {
        ServerId: 'notEmpty'
    }],
    ['get', '/server_option_template', ServerController.ServerOptionTemplate, {
        ServerId: 'notEmpty'
    }],
    ['post', '/server_option_update', ServerController.ServerOptionUpdate, {
        ServerId: 'notEmpty'
    }],
    // 命令
    ['get', '/send_command', ServerController.sendCommand, {
        serverApp: 'notEmpty',
        serverName: 'notEmpty',
        podIp: 'notEmpty',
        command: 'notEmpty'
    }],

    // 服务ServerAdapter ( 创建、列表、更新、删除 )
    ['post', '/server_adapter_create', AdapterController.ServerAdapterCreate],
    ['get', '/server_adapter_select', AdapterController.ServerAdapterSelect, {
        ServerId: 'notEmpty'
    }],
    ['post', '/server_adapter_update', AdapterController.ServerAdapterUpdate, {
        AdapterId: 'notEmpty'
    }],
    ['get', '/server_adapter_delete', AdapterController.ServerAdapterDelete, {
        AdapterId: 'notEmpty'
    }],

    // 节点管理 ( 创建、列表、更新、删除 )
    ['get', '/node_select', NodeController.NodeSelect],
    ['get', '/node_list', NodeController.NodeList],
    ['post', '/ability_open', NodeController.openTafAbility, {
        NodeName: 'notEmpty'
    }],
    ['post', '/ability_close', NodeController.closeTafAbility, {
        NodeName: 'notEmpty'
    }],
    ['post', '/edit_common_tag', NodeController.editCommonTag, {
        nodeName: 'notEmpty'
    }],
    ['post', '/batch_edit_common_tag', NodeController.batchEditCommonTag, {
        nodeNames: 'notEmpty'
    }],
    ['post', '/edit_ability_tag', NodeController.editAbilityTag, {
        nodeName: 'notEmpty'
    }],
    ['post', '/batch_edit_ability_tag', NodeController.batchEditAbilityTag, {
        nodeNames: 'notEmpty'
    }],

    // 亲和性管理 ( 创建、列表、更新、删除 )
    ['get', '/affinity_list_node', AffinityController.AffinityListByNode],
    ['get', '/affinity_list_server', AffinityController.AffinityListByServer],
    ['post', '/affinity_add_server', AffinityController.AffinityAddServer, {
        NodeName: 'notEmpty',
        ServerApp: 'notEmpty'
    }],
    ['post', '/affinity_add_node', AffinityController.AffinityAddNode, {
        NodeName: 'notEmpty',
        ServerApp: 'notEmpty'
    }],
    ['post', '/affinity_del_server', AffinityController.AffinityDeleteServer, {
        NodeName: 'notEmpty',
        ServerApp: 'notEmpty'
    }],
    ['post', '/affinity_del_node', AffinityController.AffinityDeleteNode, {
        NodeName: 'notEmpty',
        ServerApp: 'notEmpty'
    }],

    // 服务K8S ( 列表、更新 )
    ['get', '/server_k8s_select', K8sController.ServerK8SSelect, {
        ServerId: 'notEmpty'
    }],
    ['post', '/server_k8s_update', K8sController.ServerK8SUpdate, {
        ServerId: 'notEmpty'
    }], //k8s管理
    ['post', '/server_k8s_update_resource', K8sController.ServerK8SUpdateResource, {
        ServerId: 'notEmpty'
    }], //资源管理
    ['post', '/server_k8s_update_network', K8sController.ServerK8SUpdateNetwork, {
        ServerId: 'notEmpty'
    }], //网络映射
    ['post', '/server_k8s_update_disk', K8sController.ServerK8SUpdateDisk, {
        ServerId: 'notEmpty'
    }], //磁盘管理
    ['get', '/generate_host_port', K8sController.ServerK8SGenerateHostPort, {
        NodeList: 'notEmpty',
        NodePort: 'notEmpty'
    }],
    ['get', '/check_host_port', K8sController.ServerK8SCheckHostPort, {
        NodePort: 'notEmpty'
    }],
    ['get', '/describe_pod', K8sController.DescribePod, {
        PodName: 'notEmpty'
    }],

    ['get', '/get_object', K8sController.getObject, {
        plural: 'notEmpty',
        ServerId: 'notEmpty'
    }],
    ['post', '/update_object', K8sController.updateObject, {
        plural: 'notEmpty',
        ServerId: 'notEmpty'
    }],


    // 发布包 ( 上传及编译、上传状态、版本列表、版本发布 )
    ['post', '/upload_and_publish', PatchController.uploadAndPatch, {
        application: 'notEmpty',
        module_name: 'notEmpty',
        base_image: 'notEmpty'
    }],
    ['post', '/patch_upload', PatchController.uploadPatchPackage, {
        ServerId: 'notEmpty',
        ServerType: 'notEmpty',
        BaseImage: 'notEmpty'
    }],
    ['get', '/patch_upload_status', PatchController.uploadPatchStatus, {
        BuildId: 'notEmpty'
    }],
    ['get', '/patch_list', PatchController.ServicePoolSelect, {
        ServerId: 'notEmpty'
    }],
    ['get', '/build_list', PatchController.BuildSelect, {
        ServerId: 'notEmpty'
    }],
    ['get', '/delete_build', PatchController.DeleteBuild, {
        ImageName: 'notEmpty'
    }],


    ['get', '/get_now_image', PatchController.ServiceNowImages, {
        ServerId: 'notEmpty'
    }],
    ['post', '/patch_publish', PatchController.ServicePoolUpdate, {
        Id: 'notEmpty',
        ServerId: 'notEmpty'
    }],

    //image管理
    ['get', '/image_select', ImageController.ImageSelect],
    ['get', '/node_image', ImageController.NodeImageSelect],
    ['post', '/image_create', ImageController.ImageCreate, {
        SupportedType: 'notEmpty'
    }],
    ['post', '/image_update', ImageController.ImageUpdate, {
        Name: 'notEmpty',
        SupportedType: 'notEmpty'
    }],
    ['post', '/image_delete', ImageController.ImageDelete, {
        Name: 'notEmpty'
    }],
    ['get', '/image_release_select', ImageController.ImageReleaseSelect, {
        Name: 'notEmpty'
    }],
    ['get', '/base_image_list', ImageController.BaseImageSelect, {
        ServerType: 'notEmpty'
    }],
    ['post', '/image_release_delete', ImageController.ImageReleaseDelete, {
        Name: 'notEmpty',
        Id: 'notEmpty'
    }],
    ['post', '/image_release_create', ImageController.ImageReleaseCreate, {
        Name: 'notEmpty',
        Image: 'notEmpty',
        Secret: 'notEmpty'
    }],
    ['get', '/image_node_select', ImageController.ImageNodeSelect],
    ['post', '/image_node_update', ImageController.ImageNodeUpdate],
    ['post', '/image_node_delete', ImageController.ImageNodeDelete],

    //HorizontalPodAutoscaler 管理
    ['post', '/create_hpa', HPAController.HPACreate],
    ['get', '/get_hpa', HPAController.getHPAByName],
    ['get', '/get_hpa_target', HPAController.getHPACustomTarget],

    ['get', '/get_events', EventController.getEvents, {
        startDate: 'notEmpty',
        endDate: 'notEmpty'
    }],
    ['get', '/get_pods', EventController.getPods, {
        application: 'notEmpty',
        serverName: 'notEmpty',
        startDate: 'notEmpty',
        endDate: 'notEmpty'
    }],

    //集群管理
    ["get", "/get_tfc", FrameworkController.getFrameworkConfig],
    ["post", "/save_tfc_item", FrameworkController.saveFrameworkConfig]
];

module.exports = {
    k8sApiConf
};

// k8sApiConf.forEach(conf => apiConf.push(conf));