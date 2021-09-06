const WebConf = require('../../../config/webConf');
const logger = require('../../../logger');

if (WebConf.isEnableK8s()) {
    logger.info("WebConf.isEnableK8s()", WebConf.isEnableK8s());
    module.exports = require('./../../k8s-service/auth/AuthService');
} else {
    logger.info("WebConf.isEnableK8s()", WebConf.isEnableK8s());
    module.exports = require('./../../db-service/auth/AuthService');
}

