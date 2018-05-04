var send = require('koa-send');
var resolve = require('path').resolve;
module.exports = (root, needNext, opt) => {
    opt = Object.assign({}, opt);
    opt.root = resolve(root);
    return async(ctx, next) => {
        try {
            await send(ctx, ctx.path, opt);
        } catch (err) {
            if (err.status !== 404) {
                throw err;
            }
        }
        if (needNext) {
            await next();
        }
    };
}
