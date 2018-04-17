/**
 * Created by denisfan on 2018/4/6.
 */
const DemoController = require('../controller/demo/DemoController');

const pageConf = [
    ['get', '/', DemoController.index]
]


const apiConf = [
    ['get', '/getJson', DemoController.getJson, {id: 'notEmpty;object'}],
    ['get', '/getSqlData', DemoController.getSqlData, {id: 'notEmpty;number'}],
    ['get', '/getRpcData', DemoController.getRpcData, {id: 'notEmpty;number'}]
]

module.exports = {pageConf, apiConf};