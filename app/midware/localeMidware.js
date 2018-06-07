const cn = require('../../locale/cn.json');
const en = require('../../locale/en.json');
const stream = require('stream');
const _ = require('lodash');

const localeMap = {'cn': formatJson(cn), 'en': formatJson(en)};

function formatJson(localeJson){
    let resultJson = {};
    (function(localeJson, keyPart, resultJson){
        var args = arguments;
        _.each(localeJson, (value, key)=> {
            var newKeyPart = keyPart ? (keyPart + '.' + key) : key;
            if (!_.isObject(value)) {
                resultJson['#' + newKeyPart + '#'] = value;
            }else{
                args.callee(value, newKeyPart, resultJson);
            }
        });
    })(localeJson, '', resultJson)

    return resultJson;
}

module.exports = async(ctx, next)=> {
    if (!!ctx.body) {
        var lan = ctx.paramsObj && ctx.paramsObj.__locale || ctx.cookies.get('locale') || 'cn';
        var content = '';
        var contentType = '';
        if (_.isString(ctx.body)) {
            content = ctx.body;
            contentType = 'string';
        } else if (_.isObject(ctx.body)) {
            content = JSON.stringify(ctx.body);
            contentType = 'object';
        }
        let matchList = content.match( /#[a-zA-Z0-9\._]+#/g);
        _.each(matchList, (matchStr) => {
            let str = localeMap[lan][matchStr]
            if(str){
                content = content.replace(matchStr, str);
            }
        });
        if (contentType == 'object') {
            ctx.body = JSON.parse(content);
        } else {
            ctx.body = content;
        }
    }
    await next()
};

