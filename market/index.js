const MarketController = require('./controller/MarketController');

const marketApiConf = [

    ['post', '/install', MarketController.install, {
        deploy: 'notEmpty'
    }],

];

module.exports = {
    marketApiConf
};