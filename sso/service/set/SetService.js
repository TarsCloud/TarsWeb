const WebConf = require('../../../config/webConf');

if (WebConf.isEnableK8s()) {
    module.exports = require('./../../k8s-service/set/SetService');
} else {
    module.exports = require('./../../db-service/set/SetService');
}
