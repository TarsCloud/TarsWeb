# TarsNodeWeb

## 安装
`npm install`

### 开发
- 启动 tars-node-server (cd ../ && npm run dev)
- 在vue.config.js中配置devServer的代理，以及webpack-dev-server的端口等
- npm run dev开始开发调试  

在本地开发时可以将web项目的ajax请求代理到一个部署好环境的web server地址，以去除开发web项目时的后端接口环境依赖。
```js
{
    //是否自动在浏览器中打开
    open: true,
    //web-dev-server地址
    //port: 8088,
    //ajax请求代理
    proxy: {
        "/pages/server/api": {
            target: `http://0.0.0.0:${server_port}`,
            changeOrigin: false
        },
        "/auth": {
            target: `http://0.0.0.0:${server_port}`,
            changeOrigin: false
        }
        }
}
```
### 打包发布
`npm run build`

