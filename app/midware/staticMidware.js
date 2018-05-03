var send = require('koa-send');
var resolve = require('path').resolve;
module.exports = (root, needNext, opt) =>{
    opt = Object.assign({}, opt);
    opt.root = resolve(root);
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


//
// 'use strict'
//
// /**
//  * Module dependencies.
//  */
//
// const debug = require('debug')('koa-static')
// const { resolve } = require('path')
// const assert = require('assert')
// const send = require('koa-send')
//
// /**
//  * Expose `serve()`.
//  */
//
// module.exports = serve
//
// /**
//  * Serve static files from `root`.
//  *
//  * @param {String} root
//  * @param {Object} [opts]
//  * @return {Function}
//  * @api public
//  */
//
// function serve (root, needNext, opts) {
//     opts = Object.assign({}, opts)
//
//     assert(root, 'root directory is required to serve files')
//
//     // options
//     debug('static "%s" %j', root, opts)
//     opts.root = resolve(root)
//
//     if (opts.index !== false) opts.index = opts.index || 'index.html'
//     return async function serve (ctx, next) {
//         let done = false
//
//         if (ctx.method === 'HEAD' || ctx.method === 'GET') {
//             try {
//                 done = await send(ctx, ctx.path, opts)
//             } catch (err) {
//                 if (err.status !== 404) {
//                     throw err
//                 }
//             }
//         }
//
//         if (!done) {
//             await next()
//         }
//     }
// }
