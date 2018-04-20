var AuthDao = require('../../dao/auth/AuthDao');

function CasServer(){

};

//登录页面控制，若已经有登录信息，则直接带票据跳转
CasServer.loginPage = async function(ctx){
    if(ctx.cookies.get('user') && ctx.cookies.get('ticket')){
        var redirctUrl =  decodeURIComponent(ctx.query.service || '/');
        ctx.redirect(redirctUrl);
    }else{
        await ctx.render('auth/login');
    }
}

//注册页面控制
CasServer.registerPage = async function(ctx){
    await ctx.render('auth/register');
}


//登出操作，清理session并跳转
CasServer.logout = function(ctx){
    if(ctx.cookies.get('user')){
        ctx.cookies.set('user', null);
    }
    if(ctx.cookies.get('ticket')){
        ctx.cookies.set('ticket', null);
    }
    ctx.redirect('/');
};

CasServer.login = async function(ctx){
    var userInfo = await AuthDao.getUserInfo(ctx.paramsObj.userName, ctx.paramsObj.password);
    if(userInfo.length >0){
        ctx.cookies.set('user', userInfo[0].user_name, {maxAge: 10 * 24 * 60 * 60 * 1000});
        ctx.cookies.set('ticket', (new Date()).getTime(), {maxAge: 10 * 24 * 60 * 60 * 1000});
        ctx.makeResObj(200, '', {});
    }else{
        ctx.makeResObj(500, '#login.error#', {});
    }
};

CasServer.getUserInfoByTicket = async function(ctx){
    ctx.makeResObj(200, '', {user_name: 'denisfan'});
};

CasServer.validate = async function(ctx){
    ctx.makeResObj(200, '', {correct: true});
}

CasServer.register = async function(ctx){
    var userName = ctx.paramsObj.userName;
    var password = ctx.paramsObj.password;
    var repeatPassword = ctx.paramsObj.repeatPassword;
    if(password != repeatPassword){
        ctx.makeResObj(500, '#register.noSameError#', {});
        return;
    }
    var userInfo = await AuthDao.getUserInfoByUserName(userName, password);
    if(userInfo.length){
        ctx.makeResObj(500, '#register.existError#', {});
    }else{
        await AuthDao.insertUserInfo(userName, password);
        ctx.makeResObj(200, '', {});
    }
}

module.exports = CasServer;
