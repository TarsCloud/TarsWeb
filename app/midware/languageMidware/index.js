const cn = require('./cn');
const en = require('./cn');
const stream = require('stream');
const _ = require('lodash');

//将stream转成string
function streamToString(stream) {
    return new Promise((resolve, reject)=>{
        const chunks = [];
        stream.on('data', (chunk) => {
            chunks.push(chunk.toString());
        });
        stream.on('end', () => {
            resolve(chunks.join(''));
        });
        stream.on('error', (err)=>{
            reject(err);
        })
    })
}

module.exports = async (ctx, next)=>{
    if(!!ctx.body){
        var lan = ctx.params.__lan || ctx.cookies.lan || 'cn';
        var content = '';
        var contentType = '';
        if(_.isString(ctx.body)){
            content = ctx.body;
            contentType = 'string';
        }else if(ctx.body instanceof stream){   //针对静态文件的文本流做处理
            content = await streamToString(ctx.body);
            contentType = 'stream';
        }else if(_.isObject(ctx.body)){
            content = JSON.stringify(ctx.body);
            contentType = 'object';
        }
        _.each({'cn': cn, 'en': en}[lan] || cn, (value, key)=>{
            content = content.replace('#' + key + '#', value);
        })
        if(contentType == 'object'){
            ctx.body = JSON.parse(content);
        }else{
            ctx.body = content;
        }
    }
    await next()
}

