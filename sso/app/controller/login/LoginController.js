let LoginService = require('../../service/login/LoginService')
let logger = require('../../../../app/logger');
const loginConf = require('../../../../config/loginConf');
const LoginController = {}
const exprireTime = 7 * 24 *60 * 60 * 1000;


LoginController.indexPage = async(ctx) =>{
    await ctx.redirect('/index.html');
};

//登录页面控制，若已经有登录信息，则直接带票据跳转
LoginController.loginPage = async (ctx) => {
    let uid = ctx.cookies.get('uid');
    let ticket =  ctx.cookies.get('ticket');
    if(uid && ticket){
        if(await LoginService.validate(uid, ticket)){
            ctx.redirect(ctx.paramsObj.redirect_url || '/');
            return;
        }
    }
    await ctx.render('login/login',{redirect_url: ctx.paramsObj.redirect_url || '/'});
};

//注册页面控制
LoginController.registerPage = async (ctx) => {
    await ctx.render('login/register', {redirect_url: ctx.paramsObj.redirect_url || '/'});
};

//登出操作，清理session并跳转
LoginController.logout = async (ctx) => {
    await ctx.redirect('/');
};

//登录接口
LoginController.login = async (ctx) => {
    // console.log('login', ctx);

    let uid = ctx.paramsObj.uid;
    let password = ctx.paramsObj.password;
    const captcha = ctx.paramsObj.captcha
    const sessionCaptcha = ctx.session.captcha
    try{
        if(captcha === sessionCaptcha){
        let rst = await LoginService.login(uid, password);
        if(rst.errMsg === undefined){
            // ctx.cookies.set('ticket', rst.ticket,  {maxAge: exprireTime});
            // ctx.cookies.set('uid', uid,  {maxAge: exprireTime});
            ctx.makeResObj(200, rst.errMsg, {ticket: rst.ticket});
        }else{
            ctx.makeResObj(500, rst.errMsg, {});
            }
        }else{
            ctx.makeResObj(500, 'verify code error', {});
        }
    }catch(e){
        logger.error('[login]' , e, ctx);
        ctx.makeErrResObj();
    }
};

//通过ticket取用户信息接口
LoginController.getUidByTicket = async (ctx) => {
    try{
        let ticket = ctx.paramsObj.ticket;
        let uid = '';
        if(uid = await LoginService.getUidByTicket(ticket)){
            ctx.makeResObj(200, '', {uid: uid});
        }else{
            ctx.makeResObj(200, '', {uid: ''});
        }
    }catch(e){
        logger.error('[getUidByTicket]' , e, ctx);
        ctx.makeErrResObj();
    }
};

//校验ticket是否可用
LoginController.validate = async (ctx) => {
    try{
        let uid = ctx.paramsObj.uid;
        let ticket = ctx.paramsObj.ticket;
        ctx.makeResObj(200, '', {result: await LoginService.validate(uid, ticket)});
    }catch(e){
        logger.error('[validate]' , e, ctx);
        ctx.makeErrResObj();
    }
};

//注册接口
LoginController.register = async (ctx) => {
    let uid = ctx.paramsObj.uid;
    let password = ctx.paramsObj.password;
    let repeatPassword = ctx.paramsObj.repeat_password;
    if(password != repeatPassword){
        ctx.makeResObj(500, '#login.passwordDiff#', {});
        return;
    }
    try{
        let rst = await LoginService.register(uid, password);
        if(rst && rst.errMsg){
            ctx.makeResObj(500, rst.errMsg, {});
        }else{
            ctx.makeResObj(200, '', {});
        }
    }catch(e){
        logger.error('[register]', e, ctx);
        ctx.makeErrResObj();
    }
};

LoginController.isEnableLogin = async(ctx) =>{
    try{
        ctx.makeResObj(200, '', {enableLogin: loginConf.enableLogin || false});
    }catch(e){
        logger.error('[getLoginUid]', e, ctx);
        ctx.makeErrResObj();
    }
};

LoginController.getLoginUid = async(ctx) =>{
    try{
        ctx.makeResObj(200, '', {uid: ctx.uid || ''});
    }catch(e){
        logger.error('[getLoginUid]', e, ctx);
        ctx.makeErrResObj();
    }
};


module.exports = LoginController;
