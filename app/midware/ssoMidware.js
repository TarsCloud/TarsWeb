// 第三方登录相关
const request = require('request-promise-any');
const _ = require('lodash');
const url = require('url');

module.exports = (loginConf) => {
  try {
    const cookieDomainConfig = {
      domain: loginConf.cookieDomain || '', // 用户cookie域
    };
    const cookieConfig = Object.assign({
      maxAge: 365 * 24 * 60 * 60 * 1000, // 用户cookie过期时间为1年
    }, cookieDomainConfig);

    return async (ctx, next) => {

      // console.log(ctx.request.path);

      if (ctx.request.path === '/logout') {
        ctx.cookies.set(loginConf.ticketCookieName || 'ticket', null, cookieDomainConfig);
        ctx.cookies.set(loginConf.uidCookieName || 'uid', null, cookieDomainConfig);
        toLogoutPage(ctx);
      } else if (!loginConf.enableLogin) {
        ctx.uid = loginConf.defaultLoginUid || '';
        await next();
      } else if (isInPath(ctx, loginConf.ignore || []) || isInIgnoreIps(ctx, loginConf.ignoreIps || [])) { // 跳过用户配置的不需要验证的url或白名单IP
        ctx.uid = ctx.query.uid || loginConf.defaultLoginUid;
       
        await next();
      } else {
        let ticket; let uid;
        const ticketFromQuery = ctx.query[loginConf.ticketParamName || 'ticket'];
        if (ticket = ticketFromQuery) {
          uid = await getUid(ctx, ticket);
          if (uid) {
            await ctx.cookies.set(loginConf.ticketCookieName || 'ticket', ticket, cookieConfig);
            await ctx.cookies.set(loginConf.uidCookieName || 'uid', uid, cookieConfig);
          }
        }
        if (!uid) {
          uid = ctx.cookies.get(loginConf.uidCookieName || 'uid');
        }
        if (!ticket) {
          ticket = ctx.cookies.get(loginConf.ticketCookieName || 'ticket');
        }

        ticket = ticket || '';

        // console.log("ticket:", ticket);

        if (await validate(ctx, uid, ticket)) {
          ctx.uid = uid;
          if (ticketFromQuery && !isInPath(ctx, loginConf.apiPrefix || [])) {
            const urlObj = url.parse(ctx.request.url, true);
            delete (urlObj.query[loginConf.ticketParamName || 'ticket']);
            delete (urlObj.search);
            const redirectUrl = url.format(urlObj);
            ctx.redirect(redirectUrl);
          } else {
            await next();
          }
        } else if (isInPath(ctx, loginConf.apiPrefix)) {
          ctx.body = { ret_code: 500, err_msg: loginConf.apiNotLoginMes, data: {} };
        } else {
          toLoginPage(ctx);
        }
      }
    };


    // 检测是否在path列表中
    function isInPath(ctx, pathList) {

      const pathname = ctx.request.path;

      const index = _.findIndex(pathList, (rule) => {
        if (!rule) {
          return false;
        } if (typeof rule === 'string') {
          return pathname.indexOf(rule) === 0;
        } if (rule instanceof RegExp) {
          return rule.test(pathname);
        }
      });

      return index > -1;
    }

    // 检测是否在IP白名单之中
    function isInIgnoreIps(ctx, ignoreIps) {
      const { ip } = ctx;

      return _.indexOf(ignoreIps || [], ip) > -1;
    }

    // 控制跳转到登录页面
    async function toLoginPage(ctx) {
      if (loginConf.loginUrl.indexOf('?') === -1) {
        ctx.redirect(`${loginConf.loginUrl}?${loginConf.redirectUrlParamName}=${encodeURIComponent(`${ctx.protocol}://${ctx.host}${ctx.request.url}`)}`);
      } else {
        ctx.redirect(`${loginConf.loginUrl}&${loginConf.redirectUrlParamName}=${encodeURIComponent(`${ctx.protocol}://${ctx.host}${ctx.request.url}`)}`);
      }
    }

    // 控制跳转到登出页面
    async function toLogoutPage(ctx) {
      if (loginConf.logoutUrl) {
        if (loginConf.loginUrl.indexOf('?') === -1) {
          ctx.redirect(`${loginConf.logoutUrl}?${loginConf.logoutredirectUrlParamName}=${encodeURIComponent(`${ctx.protocol}://${ctx.host}`)}`);
        } else {
          ctx.redirect(`${loginConf.logoutUrl}&${loginConf.logoutredirectUrlParamName}=${encodeURIComponent(`${ctx.protocol}://${ctx.host}`)}`);
        }
      } else {
        ctx.redirect(`${ctx.protocol}://${ctx.host}`);
      }
    }

    // 通过ticket获取用户信息
    async function getUid(ctx, ticket) {
      try {
        if (loginConf.getUidByTicket) {
          if (_.isFunction(loginConf.getUidByTicket)) {
            return await loginConf.getUidByTicket(ctx, ticket);
          }
          let uidInfo = '';
          if (loginConf.getUidByTicket.indexOf('?') === -1) {
            uidInfo = await request.get(`${loginConf.getUidByTicket}?${loginConf.getUidByTicketParamName}=${ticket}`);
          } else {
            uidInfo = await request.get(`${loginConf.getUidByTicket}&${loginConf.getUidByTicketParamName}=${ticket}`);
          }
          try {
            uidInfo = JSON.parse(uidInfo);
          } catch (e) {
            uidInfo = false;
          }
          if (!uidInfo) return false;
          return _.result(uidInfo, loginConf.uidKey) || false;
        }
        return false;
      } catch (e) {
        return false;
      }
    }

    // 判断是否ticket和uid是否有效
    async function validate(ctx, uid, ticket) {
      try {
        if (loginConf.validate) { // 如果没有配置校验接口，则表示此用户名直接有效直到过期
          if (_.isFunction(loginConf.validate)) {
            return await loginConf.validate(ctx, uid, ticket);
          }
          let validateRet = '';
          if (loginConf.validate.indexOf('?') === -1) {
            validateRet = await request.get(`${loginConf.validate}?${loginConf.validateTicketParamName}=${ticket}&${loginConf.validateUidParamName}=${uid}`);
          } else {
            validateRet = await request.get(`${loginConf.validate}&${loginConf.validateTicketParamName}=${ticket}&${loginConf.validateUidParamName}=${uid}`);
          }
          try {
            validateRet = JSON.parse(validateRet);
          } catch (e) {
            validateRet = false;
          }
          if (!validateRet) return false;
          const { validateMatch } = loginConf;
          for (let i = 0; i < validateMatch.length; i++) {
            if (_.result(validateRet, validateMatch[i][0]) !== validateMatch[i][1]) {
              return false;
            }
          }
          return true;
        }
        return true;
      } catch (e) {
        throw (e);
        return false;
      }
    }
  } catch (e) {
    console.error(e);
  }
};
