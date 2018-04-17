var send = require('koa-send');
module.exports = (root, needNext, opt) =>{
    opt = Object.assign({}, opt);
    opt.root = root;
    return async function serve (ctx, next) {
        try {
            await send(ctx, ctx.path, opt)
        } catch (err) {
            if (err.status !== 404) {
                throw err
            }
        }
        if(needNext){
            await next()
        }
    };
}