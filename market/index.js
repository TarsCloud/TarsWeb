const MarketController = require('./controller/MarketController');

const marketApiConf = [


    ['post', '/get', MarketController.get, {
        app: 'notEmpty',
        server: 'notEmpty',
        k8s: 'notEmpty',
    }],

    ['get', '/list_install', MarketController.listInstall, {
        k8s: 'notEmpty',
    }],

    ['post', '/uninstall_server', MarketController.uninstallServer, {
        k8s: 'notEmpty',
        app: 'notEmpty',
        server: 'notEmpty',
    }],

    ['post', '/uninstall_product', MarketController.uninstallProduct, {
        k8s: 'notEmpty',
        servers: 'notEmpty',
    }],
    //framework key
    ['post', '/get_framework_cuid', MarketController.getFrameworkCUid, {
        k8s: 'notEmpty',
    }],

    ['post', '/get_framework_ticket', MarketController.getFrameworkTicket, {
        secret: 'notEmpty',
        k8s: 'notEmpty',
    }],
    ['post', '/update_framework_autologin', MarketController.updateFrameworkAutoLogin, {
        autologin: 'notEmpty',
        k8s: 'notEmpty',
    }],
    ['post', '/update_framework_key', MarketController.updateFrameworkKey, {
        priKey: 'notEmpty',
        cuid: 'notEmpty',
        k8s: 'notEmpty',
    }],
];

module.exports = {
    marketApiConf
};