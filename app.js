const Koa = require('koa');
const app = new Koa();
const path = require('path');
const views = require('koa-views');
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser');
const multer = require('koa-multer');

const {pageRouter, apiRouter} = require('./app/router');
const preMidware = require('./app/midware/preMidware');
const postMidware = require('./app/midware/postMidware');
const helmet = require("koa-helmet");
// const compress = require('koa-compress')
const loginMidware = require('./app/midware/loginMidware');
const staticMidware = require('./app/midware/staticMidware');

const upload = multer({dest: './uploads/'});

// error handler
onerror(app);

//安全防护
app.use(helmet());

//设置ejs模板
app.use(views(__dirname + '/views', {
    extension: 'ejs'
}));

app.use(bodyparser());

app.use(upload.single('suse')); //这里决定了上传包的name只能叫suse。

//前置中间件
preMidware.forEach((midware)=>{
    app.use(midware);
});

//权限校验
app.use(loginMidware);

//激活router
app.use(pageRouter.routes(), pageRouter.allowedMethods());
app.use(apiRouter.routes(), apiRouter.allowedMethods());

//激活静态资源中间件
app.use(staticMidware(path.join(__dirname, './client/dist'), {maxage: 7 * 24 * 60 * 60 * 1000}));
app.use(staticMidware(path.join(__dirname, './public'), {maxage: 7 * 24 * 60 * 60 * 1000}));

//后置中间件
postMidware.forEach((midware)=>{
    app.use(midware);
});

module.exports = app;