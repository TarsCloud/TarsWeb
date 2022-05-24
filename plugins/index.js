const PluginController = require('./controller/PluginController');

const pluginApiConf = [

    ['post', '/install', PluginController.install, {
        obj: 'notEmpty',
        name: 'notEmpty',
        name_en: 'notEmpty',
        type: 'notEmpty',
    }],

    ['get', '/list', PluginController.list],

];

module.exports = {
    pluginApiConf
};