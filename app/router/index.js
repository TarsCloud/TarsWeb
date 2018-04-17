/**
 * Created by denisfan on 2018/4/6.
 */
const {pageConf, apiConf} = require('./routerConf');
const Router = require('koa-router');
const _ = require('lodash');
const noCacheMidware = require('../midware/noCacheMidware');
const staticMidware = require('../midware/staticMidware');
const {paramsDealMidware, paramsCheckMidware} = require('../midware/paramsMidware');



//获取路由
const getRouter = (router, routerConf) =>{
    routerConf.forEach(function(conf){
        var [method, url, controller, checkRule] = conf;

        //前置参数合并校验相关中间件
        router[method](url, paramsDealMidware);    //上下文入参出参处理中间件
        router[method](url, async (ctx, next) => {return paramsCheckMidware(ctx, next, checkRule);});   //参数校验中间件
        router[method](url, noCacheMidware);       //禁用缓存中间件

        //业务逻辑控制器
        router[method](url, async(ctx, next) => {
            await controller.call({}, ctx);
            await next();
        });

    });
};

//页面类型路由
const pageRouter = new Router();
getRouter(pageRouter, pageConf);

//接口类型路由
const apiRouter = new Router();
apiRouter.prefix('/api');
getRouter(apiRouter, apiConf);

//静态资源类型路由
const staticRouter = new Router();
staticRouter.get('/css/*', staticMidware('../public', true, {maxage: 7 * 24 * 60 * 60 * 1000}));
staticRouter.get('/js/*', staticMidware('../public', true, {maxage: 7 * 24 * 60 * 60 * 1000}));
staticRouter.get('/img/*', staticMidware('../public',false, {maxage: 7 * 24 * 60 * 60 * 1000}));

module.exports = {pageRouter, apiRouter, staticRouter};