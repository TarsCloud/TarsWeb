const assert = require('assert');
const Module = require('module');

const originalLoad = Module._load;
Module._load = function patchedLoad(request, parent, isMain) {
  if (request === 'request-promise-any') {
    return {};
  }
  if (request === 'lodash') {
    return {
      findIndex: (list, predicate) => list.findIndex(predicate),
      indexOf: (list, value) => list.indexOf(value),
      isFunction: (value) => typeof value === 'function',
      result: (obj, path) => path.split('.').reduce((value, key) => value && value[key], obj),
    };
  }
  return originalLoad.call(this, request, parent, isMain);
};

const createSsoMidware = require('../../midware/ssoMidware');
Module._load = originalLoad;

function createCtx(overrides = {}) {
  const socket = {
    remoteAddress: '203.0.113.10',
  };
  const ctx = {
    ip: '',
    protocol: 'http',
    host: 'example.com',
    query: {},
    request: {
      path: '/api/auth/page/getUserIdList',
      url: '/api/auth/page/getUserIdList',
      socket,
    },
    req: {
      socket,
    },
    cookies: {
      get: () => '',
      set: () => {},
    },
    body: undefined,
    redirect: () => {},
    ...overrides,
  };

  if (!ctx.request.socket && ctx.req && ctx.req.socket) {
    ctx.request.socket = ctx.req.socket;
  }
  return ctx;
}

function createLoginConf(overrides = {}) {
  return {
    enableLogin: true,
    defaultLoginUid: 'admin',
    ticketCookieName: 'ticket',
    uidCookieName: 'uid',
    ticketParamName: 'ticket',
    apiPrefix: ['/api'],
    apiNotLoginMes: '#common.noLogin#',
    loginUrl: '/login.html',
    logoutUrl: '',
    logoutredirectUrlParamName: 'url',
    redirectUrlParamName: 'redirect_url',
    getUidByTicket: async () => false,
    validate: async () => false,
    ignore: [],
    ignoreIps: [],
    ...overrides,
  };
}

async function test(name, fn) {
  try {
    await fn();
    console.log(`ok - ${name}`);
  } catch (err) {
    console.error(`not ok - ${name}`);
    throw err;
  }
}

(async () => {
  await test('does not trust spoofed forwarded client IP to impersonate a uid', async () => {
    const middleware = createSsoMidware(createLoginConf({
      ignoreIps: ['127.0.0.1'],
    }));
    const ctx = createCtx({
      ip: '127.0.0.1',
      query: {
        uid: 'admin',
      },
    });
    let nextCalled = false;

    await middleware(ctx, async () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, false);
    assert.notStrictEqual(ctx.uid, 'admin');
    assert.deepStrictEqual(ctx.body, {
      ret_code: 500,
      err_msg: '#common.noLogin#',
      data: {},
    });
  });

  await test('uses configured default uid instead of query uid for real whitelisted callers', async () => {
    const middleware = createSsoMidware(createLoginConf({
      defaultLoginUid: 'internal-user',
      ignoreIps: ['127.0.0.1'],
    }));
    const socket = {
      remoteAddress: '::ffff:127.0.0.1',
    };
    const ctx = createCtx({
      ip: '203.0.113.10',
      query: {
        uid: 'admin',
      },
      req: {
        socket,
      },
      request: {
        path: '/api/auth/page/getUserIdList',
        url: '/api/auth/page/getUserIdList',
        socket,
      },
    });
    let nextCalled = false;

    await middleware(ctx, async () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(ctx.uid, 'internal-user');
  });

  await test('keeps existing path ignore behavior', async () => {
    const middleware = createSsoMidware(createLoginConf({
      ignore: ['/static'],
    }));
    const ctx = createCtx({
      request: {
        path: '/static/app.js',
        url: '/static/app.js?uid=guest',
      },
      query: {
        uid: 'guest',
      },
    });
    let nextCalled = false;

    await middleware(ctx, async () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(ctx.uid, 'guest');
  });
})();
