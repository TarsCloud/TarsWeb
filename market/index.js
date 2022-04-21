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
];

module.exports = {
    marketApiConf
};