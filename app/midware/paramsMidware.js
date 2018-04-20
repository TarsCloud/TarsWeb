/**
 * Created by denisfan on 2018/4/11.
 */

const _ = require('lodash');
const validator = require('validator');
const languageMidware = require('./languageMidware');

//api入参出参中间件
const paramsDealMidware = async (ctx, next) =>{
    ctx.paramsObj = _.extend(ctx.query || {}, ctx.request.body || {});
    ctx.makeResObj = (retCode, errMsg, result) => {
        ctx.body = {data: result || {}, ret_code: retCode, err_msg:errMsg};
    }
    await next();
}

const paramsCheckMidware = async (ctx, next, checkRule) => {
    var params = ctx.paramsObj === undefined ? ctx.paramsObj : _.extend(ctx.query || {}, ctx.request.body || {});
    checkRule = checkRule ||{};
    var hasError = false;
    _.each(checkRule, (rules, paramName) => {
        if(rules){
            var value = params[paramName] != undefined ? params[paramName].toString() : '';
            _.each(rules.split(';'), (rule) =>{
                if(rule === 'notEmpty' && validator.isEmpty(value)){
                    hasError = true;
                    ctx.makeResObj(500, paramName + '#common.notempty#');
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
        languageMidware(ctx, async()=>{});
    }
}

module.exports = {
    paramsDealMidware,
    paramsCheckMidware
}