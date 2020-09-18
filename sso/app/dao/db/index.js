/**
 * Created by denisfan on 2018/4/8.
 */

const Sequelize = require('sequelize');

const update = require('./update');

const fs = require('fs-extra');

const _ = require('lodash');

const webConf = require('../../../../config/webConf');

const logger = require('../../../../app/logger');

let dbConf = webConf.dbConf;

let Db = {};

let databases = ['db_user_system'];

databases.forEach((database)=>{
    let {
        host,
        port,
        user,
        password,
        charset,
        pool,
    } = dbConf;

    //初始化sequelize
    const sequelize = new Sequelize(database, user, password, {
        host,
        port,
        dialect: 'mysql',
        dialectOptions: {
            charset: charset
        },
        define: {
            charset: charset
        },
        logging(sqlText){
            // logger.info(sqlText);
            logger.sql(sqlText);
        },
        pool: {
            max: pool.max || 10,
            min: pool.min || 0,
            idle: pool.idle || 10000
        },
        timezone: (()=> {
            let offset = 0 - new Date().getTimezoneOffset();
			return (offset >= 0 ? '+' : '-') + (Math.abs(parseInt(offset/60)) + '').padStart(2, '0') + ':' + (offset%60 + '').padStart(2, '0');
        })()  //获取当前时区并做转换
    });

    // 测试是否连接成功
    (async function () {
        try {
            let connect = await sequelize.authenticate();
            logger.info('Mysql connection has been established successfully.');

        } catch (err) {
            logger.error('Mysql connection err', err)
        }
    })();

    let tableObj = {};
    let dbModelsPath = __dirname + '/' + database  + '_models';
    let dbModels = fs.readdirSync(dbModelsPath);
    dbModels.forEach(async function (dbModel) {

        let tableName = dbModel.replace(/\.js$/g, '');
        try {
            tableObj[_.camelCase(tableName)] = sequelize.import(dbModelsPath + '/' + tableName);
            await tableObj[_.camelCase(tableName)].sync({alter: true});

            logger.info('database ' + database + '.' + tableName + ' sync succ');
        } catch (e) {
            logger.error('database ' + database + '.' + tableName + ' sync error:', e);
        }

    });
    
    update.update(tableObj);

    Db[database] = tableObj;
    Db[database].sequelize = sequelize;
});


module.exports = Db;
