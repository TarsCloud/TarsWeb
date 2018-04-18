/**
 * Created by denisfan on 2018/4/6.
 */
const DemoController = require('../controller/demo/DemoController');
const ConfigController = require('../controller/config/ConfigController');

const pageConf = [
    ['get', '/', DemoController.index],
    ['get', '/service_config.html', ConfigController.index]
]


const apiConf = [
    ['get', '/getJson', DemoController.getJson, {id: 'notEmpty;object'}],
    ['get', '/getSqlData', DemoController.getSqlData, {id: 'notEmpty;number'}],
    ['get', '/getRpcData', DemoController.getRpcData, {id: 'notEmpty;number'}],

    // 服务配置接口
    ['get', '/config_file_list', ConfigController.configFileList, {id: 'notEmpty;number'}],
    ['post', '/add_config_file', ConfigController.addConfigFile],
]

module.exports = {pageConf, apiConf};