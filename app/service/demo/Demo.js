/**
 * Created by denisfan on 2018/4/8.
 */

const {
    tAdapterConf,
    sequelize
} = require('../../db');

const logger = require('../../logger');

const {tarsPrx, tarsStruct} = require('../util/rpcClient/index');
const tarsStream = require('@tars/stream');

function Demo(){

}

/*查看数据库数据*/
Demo.getSqlData = async () => {
    let count = await tAdapterConf.count();
    let result = await tAdapterConf.findAll({
        limit: 2,
        offset: 4,
        raw: true
    });
    logger.info(result);
    return result;
}

Demo.inserSqlData = async() => {
    let result = await tAdapterConf.bulkCreate(
        [
            {
                application: 'app2',
                server_name: 'server' + Math.random().toString().substring(5),
                node_name: '1.1.1.2',
                adapter_name: 'hello',
                queuecap: '11',
                queuetimeout: 50000,
                lastuser: 'denisfan'
            }
        ]
    );
    return result;
}


/*通过rpc调用后台接口*/
Demo.getRpcData = async () => {
    // var result = await tarsPrx.getUsrName('denisfan');
    // console.log(result);
    try{
        var userT = new tarsStruct.User_t();
        userT.name = 'helloworld';
        var result = await tarsPrx.getall(userT);
        return result;
    }catch(e){
        logger.error(e);
        throw(e);
    }

}

module.exports = Demo;