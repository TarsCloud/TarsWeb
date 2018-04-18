/**
 * Created by denisfan on 2018/4/8.
 */
var path = require('path');

module.exports = {
    dbConf:{
        database: 'db_tars_web', // 数据库实例
        host: 'localhost',       // 数据库地址
        user: 'root',            // 用户名
        password: 'admin',       // 密码
        charset: 'utf8_bin',     // 数据库编码
        pool: {
            max: 10,             // 连接池中最大连接数量
            min: 0,              // 连接池中最小连接数量
            idle: 10000          // 如果一个线程 10 秒钟内没有被使用过的话，那么就释放线程
        }
    },
    webConf: {
        port: 3000,              //服务启动端口
        loggerPath: path.join(__dirname, '../log'),    //本地日志的目录
        defaultLanguage: 'cn',    //cn 或 en ，用户默认的语言环境
    },
    userConf: {
        admin: ['root']          //超级管理员，依据用户体系的用户唯一ID而定
    }
};