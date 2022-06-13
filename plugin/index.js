const PluginController = require('./controller/PluginController');

const pluginApiConf = [

    ['post', '/install', PluginController.install, {
        obj: 'notEmpty',
        name: 'notEmpty',
        name_en: 'notEmpty',
        type: 'notEmpty',
        path: 'notEmpty',
    }],

    ['get', '/list', PluginController.list, {
        k8s: 'notEmpty',
    }],
];

module.exports = {
    pluginApiConf
};