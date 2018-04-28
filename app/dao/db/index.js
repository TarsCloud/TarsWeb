/**
 * Created by denisfan on 2018/4/8.
 */

const Sequelize = require('sequelize');

const Mysql = require('mysql');

const fs = require('fs-extra');

const _ = require('lodash');

const dbConfs = require('../../../config/webConf').dbConfs;

const logger = require('../../logger');

let Db = {};

dbConfs.forEach((dbConf)=>{
    let {
        database,
        host,
        user,
        password,
        charset,
        pool,
    } = dbConf;

    //初始化sequelize
    const sequelize = new Sequelize(database, user, password, {
        host,
        dialect: 'mysql',
        dialectOptions: {
            charset: charset
        },
        logging(sqlText){
            console.log(sqlText);
            logger.sql(sqlText);
        },
        pool: {
            max: pool.max || 10,
            min: pool.min || 0,
            idle: pool.idle || 10000
        },
        timezone: (()=> {
            let timezone = String(0 - new Date().getTimezoneOffset() / 60);
            return '+' + (timezone.length < 2 ? ('0' + timezone) : timezone) + ':00';
        })()  //获取当前时区并做转换
    });


    // 测试是否连接成功
    (async function () {
        try {
            let connect = await sequelize.authenticate();
            console.log('Mysql connection has been established successfully.');

        } catch (err) {
            console.error('Mysql connection err', err)
        }
    })();

    let tableObj = {};
    let dbModelsPath = __dirname + '/' + database  + '_models';
    let dbModels = fs.readdirSync(dbModelsPath);
    dbModels.forEach(function (dbModel) {
        let tableName = dbModel.replace(/\.js$/g, '');
        tableObj[_.camelCase(tableName)] = sequelize.import(dbModelsPath + '/' + tableName);
    });
    Db[database] = tableObj;

});

module.exports = Db;
