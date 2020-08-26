/**
 * Created by denisfan on 2018/4/8.
 */

const Sequelize = require('sequelize');

const update = require('./update');

const fs = require('fs-extra');

const _ = require('lodash');

const webConf = require('../../../../config/webConf');

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
            // console.log(sqlText);
            // logger.sql(sqlText);
        },
        pool: {
            max: pool.max || 10,
            min: pool.min || 0,
            idle: pool.idle || 10000
        },
        timezone: (()=> {
            let offset = 0 - new Date().getTimezoneOffset();
			return (offset >= 0 ? '+' : '-') + (Math.abs(offset/60) + '').padStart(2, '0') + ':00';
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
    dbModels.forEach(async function (dbModel) {

        let tableName = dbModel.replace(/\.js$/g, '');
        try {
            tableObj[_.camelCase(tableName)] = sequelize.import(dbModelsPath + '/' + tableName);
            await tableObj[_.camelCase(tableName)].sync({alter: true});

            console.log('database ' + database + '.' + tableName + ' sync succ');
        } catch (e) {
            console.log('database ' + database + '.' + tableName + ' sync error:', e);
        }

    });
    
    update.update(tableObj);

    Db[database] = tableObj;
    Db[database].sequelize = sequelize;
});


module.exports = Db;
