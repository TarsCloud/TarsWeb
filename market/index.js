const MarketController = require('./controller/MarketController');

const marketApiConf = [

    ['post', '/install', MarketController.install, {
        deploy: 'notEmpty',
        serviceVersion: 'notEmpty',
    }],

    ['post', '/upgrade', MarketController.upgrade, {
        deploy: 'notEmpty',
        serviceVersion: 'notEmpty',
    }],

    ['post', '/get', MarketController.get, {
        app: 'notEmpty',
        server: 'notEmpty',
    }],

    ['get', '/list_install_from_cloud', MarketController.listFromCloud],

];

module.exports = {
    marketApiConf
};