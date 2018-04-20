const Koa = require('koa')
const app = new Koa()
const path = require('path');
const views = require('koa-views')
// const staticCache = require('koa-static-cache')
// const static = require('koa-static')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const {pageRouter, apiRouter, staticRouter} = require('./app/router');
const preMidware = require('./app/midware/preMidware');
const postMidware = require('./app/midware/postMidware');
const helmet = require("koa-helmet");
// const compress = require('koa-compress')

// error handler
onerror(app)

//安全防护
app.use(helmet());

//设置ejs模板
app.use(views(__dirname + '/views', {
    extension: 'ejs'
}));

app.use(bodyparser());


//前置中间件
preMidware.forEach((midware)=>{app.use(midware)});

//资源文件设置7天缓存
// app.use(staticCache(path.join(__dirname, 'public'), {
//     maxAge: 7 * 24 * 60 * 60
// }));
// app.use(static(path.join(__dirname, 'public')));

//激活router
app.use(pageRouter.routes(), pageRouter.allowedMethods())
app.use(apiRouter.routes(), apiRouter.allowedMethods())
app.use(staticRouter.routes(), staticRouter.allowedMethods())


//后置中间件
postMidware.forEach((midware)=>{app.use(midware)});

module.exports = app;