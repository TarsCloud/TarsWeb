const _ = require('lodash');
const moment = require('moment');
const util = {};

//根据相应格式和方法过滤单一对象
util._viewFilterObj = (obj, filterSturct) => {
    if(obj.hasOwnProperty('dataValues')){
        obj = obj.dataValues;
    }
    if(!_.isPlainObject(obj)){
        return obj;
    }
    var newObj = {};
    _.each(filterSturct, function(v, key){
        if(v && _.isFunction(v)){
            newObj[key] = v(obj[key]);
        }else{
            newObj[key] = obj[key];
        }
    });
    return newObj;
}

//根据相应格式和方法过滤结果集，可过滤对象数组，或单一对象
util.viewFilter = (data, filterSturct) => {
    if(!data || !filterSturct){
        return data;
    }
    var newData;
    if(_.isArray(data)){
        newData = []
        data.forEach(function(obj){
            newData.push(util._viewFilterObj(obj, filterSturct));
        });
    }else if(data.hasOwnProperty('dataValues') || _.isPlainObject(data)){
        newData = util._viewFilterObj(data, filterSturct);
    }
    return newData;
};

//数据库时间戳转换
util.formatTimeStamp = (timeStamp) => {
    return moment(timeStamp).format('YYYY-MM-DD HH:mm:ss');
};

module.exports = {
    viewFilter: util.viewFilter,
    formatTimeStamp: util.formatTimeStamp
};