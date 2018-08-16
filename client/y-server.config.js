const path = require('path');

const bodyParser = require('body-parser');

const resolve = file => path.join(__dirname, file);

module.exports = {
  port: process.env.PORT || 8082,

  plugins: [
    (app) => {
      app.use(bodyParser.urlencoded({ extended: true }));
    },
    {
      $name: 'mock',
      mockEnable: false, // 是否使用本地模拟数据
      mockDir: resolve('src/json'), // 模拟数据根目录
    },
    {
      $name: 'proxy',
      proxyPaths: ['/pages/*'],
      proxyServer: 'https://devtars.webnovel.com',
    },
    {
      $name: 'static',
      staticPaths: {
        '/': 'http://localhost:8080',
      },
    },
  ],
};
