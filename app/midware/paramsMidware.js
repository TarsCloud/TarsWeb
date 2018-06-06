/**
 * Created by denisfan on 2018/4/11.
 */

const _ = require('lodash');
const validator = require('validator');
const localeMidware = require('./localeMidware');

//api入参出参中间件
const paramsDealMidware = (validParams) =>{
    return async (ctx, next) => {
        var params  = _.extend(ctx.query || {}, ctx.request.body || {}, ctx.req.body || {});
        if(validParams && _.isArray(validParams)){
            ctx.paramsObj = {};
            validParams.forEach(function(v){
                if(params[v] !== undefined){
                    ctx.paramsObj[v] = params[v];
                }
            });
        }else{
            ctx.paramsObj = params;
        }

        ctx.makeResObj = (retCode, errMsg, result) => {
            result = result == undefined ? {} : result;
            ctx.body = {data: result, ret_code: retCode, err_msg:errMsg};
        };
        ctx.makeErrResObj = () => {
            ctx.body = {data: {}, ret_code:500, err_msg: '系统内部错误'};
        };
        ctx.makeNotAuthResObj = () => {
            ctx.body = {data: {}, ret_code:500, err_msg: '没有操作权限'};
        };
        await next();
    }
};

const paramsCheckMidware = (checkRule) =>{
    return async(ctx, next) =>{
        var params = ctx.paramsObj === undefined ? ctx.paramsObj : _.extend(ctx.query || {}, ctx.request.body || {}, ctx.req.body || {});
        checkRule = checkRule ||{};
        var hasError = false;
        _.each(checkRule, (rules, paramName) => {
            if(rules){
                var value = params[paramName] != undefined ? params[paramName].toString() : '';
                _.each(rules.split(';'), (rule) =>{
                    if(rule === 'notEmpty' && validator.isEmpty(value)){
                        hasError = true;
                        ctx.makeResObj(500, paramName + '#common.notEmpty#');
                        return false;
                    }else if(rule === 'number' && !validator.isFloat(value)){
                        hasError = true;
                        ctx.makeResObj(500, paramName + '#common.needNumber#');
                        return false;
                    }else if(rule === 'array' && (!validator.isJSON(value) || Object.prototype.toString.call(JSON.parse(value)) !== '[object Array]')){
                        hasError = true;
                        ctx.makeResObj(500, paramName + '#common.needArray#');
                        return false;
                    }else if(rule === 'object' && (!validator.isJSON(value) || Object.prototype.toString.call(JSON.parse(value)) !== '[object Object]')){
                        hasError = true;
                        ctx.makeResObj(500, paramName + '#common.needObject#');
                        return false;
                    }else if(rule === 'boolean' && !validator.isBoolean(value)){
                        hasError = true;
                        ctx.makeResObj(500, paramName + '#common.needBoolean#');
                        return false;
                    }
                });
                if(hasError){
                    return false;
                }
            }
        })
        if(!hasError){
            await next();
        }
        else{
            localeMidware(ctx, async()=>{});
        }
    }
};

module.exports = {
    paramsDealMidware,
    paramsCheckMidware
}