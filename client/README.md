# TarsNodeWeb

## Project setup
`npm install`

### Compiles and hot-reloads for development
- start tars-node-server (cd ../ && npm run dev)
- config devServer proxy and webpack-dev-server port in vue.config.js
- npm run dev  
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

### Compiles and minifies for production
```
npm run build
```
