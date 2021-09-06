const WebConf = require('../../../config/webConf');

if (WebConf.isEnableK8s()) {
    module.exports = require('./../../k8s-service/user/UserService');
} else {
    module.exports = require('./../../db-service/user/UserService');
}
