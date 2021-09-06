const WebConf = require('../../../config/webConf');

if (WebConf.isEnableK8s()) {
    module.exports = require('./../../k8s-service/token/TokenService');
} else {
    module.exports = require('./../../db-service/token/TokenService');
}
