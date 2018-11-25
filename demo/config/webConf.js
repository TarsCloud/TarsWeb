var path = require('path');

module.exports = {
    dbConf: {
        host: '127.0.0.1',       // 数据库地址
        port: '3306',            // 数据库端口
        user: 'root',            // 用户名
        password: 'admin12345',            // 密码
        charset: 'utf8_bin',     // 数据库编码
        pool: {
            max: 10,             // 连接池中最大连接数量
            min: 0,              // 连接池中最小连接数量
            idle: 10000          // 如果一个线程 10 秒钟内没有被使用过的话，那么就释放线程
        }
    },
    webConf: {
        port: 3001,              //服务启动端口
        loggerPath: path.join(__dirname, '../log'),    //本地日志的目录
    }
};