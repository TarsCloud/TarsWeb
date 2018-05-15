const _ = require('lodash');
const moment = require('moment');
const util = {};

//根据相应格式和方法过滤单一对象
util._viewFilterObj = (obj, filterSturct) => {
    if (obj.hasOwnProperty('dataValues')) {
        obj = obj.dataValues;
    }
    if (!_.isPlainObject(obj)) {
        return obj;
    }
    var newObj = {};
    _.each(filterSturct, (v, key)=> {
        if (obj[key] !== undefined) {
            v = v || {};
            let newKey = v.key || key;
            let formatter = v.formatter || '';
            if (formatter && _.isFunction(formatter)) {
                newObj[newKey] = formatter(obj[key]);
            } else {
                newObj[newKey] = obj[key];
            }
        }
    });
    return newObj;
}

//根据相应格式和方法过滤结果集，可过滤对象数组，或单一对象
util.viewFilter = (data, filterSturct) => {
    if (!data || !filterSturct) {
        return data;
    }
    var newData;
    if (_.isArray(data)) {
        newData = []
        data.forEach((obj)=> {
            newData.push(util._viewFilterObj(obj, filterSturct));
        });
    } else if (data.hasOwnProperty('dataValues') || _.isPlainObject(data)) {
        newData = util._viewFilterObj(data, filterSturct);
    }
    return newData;
};

//数据库时间戳转换
util.formatTimeStamp = (timeStamp) => {
    return moment(timeStamp).format('YYYY-MM-DD HH:mm:ss');
};

util.getUUID = () => {

    var o, random = Math.random(), date = new Date(), ms, fmt = 'yyyyMMddHHmmss', k;
    random = ('00000' + random).replace(/\./g, '');
    random = random.substr(random.length - 5);

    o = {
        "M+": date.getMonth() + 1,
        "d+": date.getDate(),
        "H+": date.getHours(),
        "m+": date.getMinutes(),
        "s+": date.getSeconds(),
        "q+": Math.floor((date.getMonth() + 3) / 3),
        "S": date.getMilliseconds()
    };

    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }

    ms = "00" + date.getMilliseconds();
    ms = ms.substr(ms.length - 3);
    return fmt + ms + random;
};

util.leftAssign = (obj1, obj2)=> {
    _.each(obj1, (value, key) => {
        if (obj2[key]) {
            obj1[key] = obj2[key];
        }
    });
    return obj1;
};

module.exports = {
    viewFilter: util.viewFilter,
    formatTimeStamp: util.formatTimeStamp,
    getUUID: util.getUUID,
    leftAssign: util.leftAssign
};
