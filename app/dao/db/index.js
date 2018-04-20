/**
 * Created by denisfan on 2018/4/8.
 */

const Sequelize = require('sequelize');

const Mysql = require('mysql');

const fs = require('fs-extra');

const {
    database,
    host,
    user,
    password,
    charset,
    pool,
} = require('../../../config/webConf').dbConf;

const logger = require('../../logger');

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
    }
});

// 测试是否连接成功
(async function(){
    try {
        var connect = await sequelize.authenticate();
        console.log('Mysql connection has been established successfully.');

    } catch(err) {
        console.error('Mysql connection err', err)
    }
})();

var dbModels = fs.readdirSync(__dirname + "/models");
var dbObj = {};
dbModels.forEach(function(dbModel){
    var tableName = dbModel.replace(/\.js$/g, '');
    dbObj[tableName.replace(/_(\w)/g, function(a, b){return b.toUpperCase();})] = sequelize.import(__dirname + "/models/" + tableName);
});

const Db = Object.assign({
    sequelize,
    Op: Sequelize.Op,
    escape: Mysql.escape,
}, dbObj);

module.exports = Db;
