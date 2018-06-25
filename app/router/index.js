const {pageConf, apiConf} = require('./routerConf');
const Router = require('koa-router');
const _ = require('lodash');
const noCacheMidware = require('../midware/noCacheMidware');
const {paramsDealMidware, paramsCheckMidware} = require('../midware/paramsMidware');
const path = require('path');


//获取路由
const getRouter = (router, routerConf) => {
    routerConf.forEach(function (conf) {
        var [method, url, controller, checkRule, validParams] = conf;

        //前置参数合并校验相关中间件
        router[method](url, paramsDealMidware(validParams));    //上下文入参出参处理中间件
        router[method](url, paramsCheckMidware(checkRule));   //参数校验中间件
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
apiRouter.prefix('/pages/server/api');
getRouter(apiRouter, apiConf);

module.exports = {pageRouter, apiRouter};