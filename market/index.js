const MarketController = require('./controller/MarketController');

const marketApiConf = [

    ['post', '/install', MarketController.install, {
        deploy: 'notEmpty',
        serviceVersion: 'notEmpty',
        k8s: 'notEmpty',
    }],

    ['post', '/upgrade', MarketController.upgrade, {
        deploy: 'notEmpty',
        serviceVersion: 'notEmpty',
        k8s: 'notEmpty',
    }],

    ['post', '/get', MarketController.get, {
        app: 'notEmpty',
        server: 'notEmpty',
        k8s: 'notEmpty',
    }],

    ['get', '/list_install', MarketController.listInstall, {
        k8s: 'notEmpty',
    }],
];

module.exports = {
    marketApiConf
};