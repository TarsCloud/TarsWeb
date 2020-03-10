const path = require("path")
const CopyWebpackPlugin = require('copy-webpack-plugin')
const server_port = process.env.SERVER_PORT || '3001'
module.exports = {
    outputDir: "./dist",
    assetsDir:"static",
    productionSourceMap:false,
    runtimeCompiler:true,
    pages: {
      login: {
        entry: 'src/modules/login/login.js',
        template: 'src/modules/login/login.html',
        filename: 'login.html',
        title:"login",
      },
      auth: {
        entry: 'src/modules/auth/auth.js',
        template: 'src/modules/auth/auth.html',
        filename: 'auth.html',
        title:"auth",
      },
      adminPass: {
        entry: 'src/modules/adminPass/adminPass.js',
        template: 'src/modules/adminPass/adminPass.html',
        filename: 'adminPass.html',
        title:"adminPass",
      },
      pass: {
        entry: 'src/modules/pass/pass.js',
        template: 'src/modules/pass/pass.html',
        filename: 'pass.html',
        title:"pass",
      },
      register: {
        entry: 'src/modules/register/register.js',
        template: 'src/modules/register/register.html',
        filename: 'register.html',
        title:"register",
      }
    },
    configureWebpack: {
      plugins: [new CopyWebpackPlugin([{ from: path.resolve(__dirname, './src/modules/login/index.html'), 
      to: path.resolve(__dirname, './dist/index.html'), ignore: ['.*'] }])]
    },
    devServer:{
        //是否自动在浏览器中打开
        open: true,
        //web-dev-server地址
        port: 8089,
        //ajax请求代理
        proxy: {
            "/api": {
              target: `http://localhost:${server_port}`,
              changeOrigin: false
            }
          }
    }
}