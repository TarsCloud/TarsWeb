const PluginController = require('./controller/PluginController');

const pluginApiConf = [

    ['post', '/install', PluginController.install, {
        obj: 'notEmpty',
        name: 'notEmpty',
        name_en: 'notEmpty',
        type: 'notEmpty',
        path: 'notEmpty',
        k8s: 'notEmpty',
    }],

    ['get', '/list', PluginController.list, {
        k8s: 'notEmpty',
        type: 'notEmpty'
    }],

    ['get', '/listAll', PluginController.listAll, {
        k8s: 'notEmpty',
    }],

    ['get', '/load', PluginController.load, {
        k8s: 'notEmpty',
    }],

    ['post', '/delete', PluginController.delete, {
        id: 'notEmpty',
        k8s: 'notEmpty',
    }],
];

module.exports = {
    pluginApiConf
};