const WebConf = require('../../../config/webConf');

if (WebConf.isEnableK8s()) {
    module.exports = require('./../../k8s-service/login/LoginService');
} else {
    module.exports = require('./../../db-service/login/LoginService');
}
