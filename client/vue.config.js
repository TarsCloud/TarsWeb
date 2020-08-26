const path = require("path")
const CopyWebpackPlugin = require('copy-webpack-plugin')

let server_port;

if (process.env.NODE_ENV == "development") {
  server_port = process.env.SERVER_PORT || '5001'
} else {
  server_port = process.env.SERVER_PORT || '3000'
}

// console.log(process.env.NODE_ENV);
// console.log("server_port:", server_port);

module.exports = {
    outputDir: "./dist",
    assetsDir: "static",
    productionSourceMap:false,
    runtimeCompiler:true,
    pages: {
      index: {
        entry: 'src/main.js',
        template: 'public/index.html',
        filename: 'index.html',
        title:"Tars",
      },
      dcache: {
        entry: 'src/dcache.js',
        template: 'public/index.html',
        filename: 'dcache.html',
        title:"DCache",
      },
      login: {
        entry: 'src/sso/login/login.js',
        template: 'src/sso/login/login.html',
        filename: 'login.html',
        title: "login",
      },
      auth: {
        entry: 'src/sso/auth/auth.js',
        template: 'src/sso/auth/auth.html',
        filename: 'auth.html',
        title: "auth",
      },
      adminPass: {
        entry: 'src/sso/adminPass/adminPass.js',
        template: 'src/sso/adminPass/adminPass.html',
        filename: 'adminPass.html',
        title: "adminPass",
      },
      pass: {
        entry: 'src/sso/pass/pass.js',
        template: 'src/sso/pass/pass.html',
        filename: 'pass.html',
        title: "pass",
      },
      register: {
        entry: 'src/sso/register/register.js',
        template: 'src/sso/register/register.html',
        filename: 'register.html',
        title: "register",
      }
    },
    configureWebpack: {
      plugins: [new CopyWebpackPlugin([{ from: path.resolve(__dirname, './static'), to: path.resolve(__dirname, './dist/static'), ignore: ['.*'] }])]
    },
    devServer:{
        //是否自动在浏览器中打开
        disableHostCheck: true,
        open: true,
        host: '0.0.0.0',
        //web-dev-server地址
        port: 8088,
        //ajax请求代理
        proxy: {
            "/pages/server/api": {
              target: `http://127.0.0.1:${server_port}`,
              changeOrigin: false
          },
          "/pages/sso/api": {
            target: `http://127.0.0.1:${server_port}`,
            changeOrigin: false
          },
          "/api": {
            target: `http://127.0.0.1:${server_port}`,
            changeOrigin: false
          },
          "/auth": {
            target: `http://127.0.0.1:${server_port}`,
            changeOrigin: false
          },
          "/captcha": {
            target: `http://127.0.0.1:${server_port}`,
            changeOrigin: false
          },
          "/web_version":{
            target: `http://127.0.0.1:${server_port}`,
            changeOrigin: false
          },
          "/favicon.ico":{
            target: `http://127.0.0.1:${server_port}`,
            changeOrigin: false
          }
        }
    }
}