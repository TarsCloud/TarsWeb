const assert = require('assert');
const Module = require('module');

function createMockFn(impl) {
  const fn = async (...args) => {
    fn.calls.push(args);
    return impl ? impl(...args) : undefined;
  };
  fn.calls = [];
  fn.setImpl = (nextImpl) => {
    impl = nextImpl;
  };
  fn.reset = () => {
    fn.calls = [];
  };
  return fn;
}

const mocks = {
  hasDevAuth: createMockFn(async () => false),
  hasOpeAuth: createMockFn(async () => false),
  addServerPatch: createMockFn(),
  find: createMockFn(),
  setPatchPackageDefault: createMockFn(),
  deleteServerPatchById: createMockFn(),
  addPatchTask: createMockFn(),
  getServerPatchByTaskId: createMockFn(),
  getServerConf: createMockFn(),
  getServerConfList4Tree: createMockFn(),
  addTask: createMockFn(),
  getTaskRsp: createMockFn(),
  deletePatchFile: createMockFn(),
  ensureDirSync: createMockFn(),
  rename: createMockFn(),
  createReadStream: createMockFn(async () => 'stream'),
  md5Sum: (...args) => {
    mocks.md5Sum.calls.push(args);
    return 'md5-1';
  },
  getUUID: () => 'uuid-1',
  sleep: createMockFn(),
};
mocks.md5Sum.calls = [];

const mockModules = {
  '../../../logger': { error: () => {}, info: () => {} },
  '../../service/patch/PatchService': {
    addServerPatch: (...args) => mocks.addServerPatch(...args),
    find: (...args) => mocks.find(...args),
    setPatchPackageDefault: (...args) => mocks.setPatchPackageDefault(...args),
    deleteServerPatchById: (...args) => mocks.deleteServerPatchById(...args),
  },
  '../../service/patch/CompileService': {
    addPatchTask: (...args) => mocks.addPatchTask(...args),
    getServerPatchByTaskId: (...args) => mocks.getServerPatchByTaskId(...args),
  },
  '../../service/auth/AuthService': {
    hasDevAuth: (...args) => mocks.hasDevAuth(...args),
    hasOpeAuth: (...args) => mocks.hasOpeAuth(...args),
  },
  '../../service/admin/AdminService': {
    deletePatchFile: (...args) => mocks.deletePatchFile(...args),
  },
  '../../service/server/ServerService': {
    getServerConf: (...args) => mocks.getServerConf(...args),
    getServerConfList4Tree: (...args) => mocks.getServerConfList4Tree(...args),
  },
  '../../service/task/TaskService': {
    addTask: (...args) => mocks.addTask(...args),
    getTaskRsp: (...args) => mocks.getTaskRsp(...args),
  },
  '../../../config/webConf': {
    pkgUploadPath: { path: '/tmp/tars-web-upload' },
    isEnableK8s: () => false,
  },
  '../../../tools/util': {
    getUUID: (...args) => mocks.getUUID(...args),
    sleep: (...args) => mocks.sleep(...args),
    viewFilter: (value) => value,
    formatTimeStamp: (value) => value,
  },
  'fs-extra': {
    ensureDirSync: (...args) => mocks.ensureDirSync(...args),
    rename: (...args) => mocks.rename(...args),
    createReadStream: (...args) => mocks.createReadStream(...args),
  },
  'md5-file': {
    sync: (...args) => mocks.md5Sum(...args),
  },
  'koa-send': {},
};

const originalLoad = Module._load;
Module._load = function patchedLoad(request, parent, isMain) {
  if (Object.prototype.hasOwnProperty.call(mockModules, request)) {
    return mockModules[request];
  }
  return originalLoad.call(this, request, parent, isMain);
};

const PatchController = require('../../app/controller/patch/PatchController');
Module._load = originalLoad;

function resetMocks() {
  Object.keys(mocks).forEach((key) => {
    if (mocks[key] && mocks[key].reset) {
      mocks[key].reset();
    }
  });
  mocks.md5Sum.calls = [];
  mocks.hasDevAuth.setImpl(async () => false);
  mocks.hasOpeAuth.setImpl(async () => false);
  mocks.find.setImpl(async () => null);
  mocks.getServerConf.setImpl(async () => []);
  mocks.getServerConfList4Tree.setImpl(async () => []);
  mocks.getServerPatchByTaskId.setImpl(async () => ({ id: 1 }));
  mocks.getTaskRsp.setImpl(async () => ({ status: 2, task_no: 'task-1', items: [] }));
}

function createCtx(overrides = {}) {
  const ctx = {
    uid: 'devuser',
    req: {
      body: {},
      files: [],
    },
    paramsObj: {},
    body: '',
    headers: {},
    set: (...args) => {
      ctx.headers[args[0]] = args[1];
      ctx.set.calls.push(args);
    },
    makeResObj: (retCode, errMsg, data = {}) => {
      ctx.body = { data, ret_code: retCode, err_msg: errMsg };
      ctx.makeResObj.calls.push([retCode, errMsg, data]);
    },
    makeErrResObj: (retCode, errMsg) => {
      ctx.body = { data: {}, ret_code: 500, err_msg: errMsg || '#common.systemError#' };
      ctx.makeErrResObj.calls.push([retCode, errMsg]);
    },
    makeNotAuthResObj: () => {
      ctx.body = { data: {}, ret_code: 500, err_msg: '#common.noPrivilage#' };
      ctx.makeNotAuthResObj.calls.push([]);
    },
    ...overrides,
  };
  ctx.set.calls = [];
  ctx.makeResObj.calls = [];
  ctx.makeErrResObj.calls = [];
  ctx.makeNotAuthResObj.calls = [];
  return ctx;
}

async function test(name, fn) {
  try {
    resetMocks();
    await fn();
    console.log(`ok - ${name}`);
  } catch (err) {
    console.error(`not ok - ${name}`);
    throw err;
  }
}

(async () => {
  await test('blocks uploadAndPublish before package upload when caller lacks operator auth', async () => {
    const ctx = createCtx({
      req: {
        body: {
          application: 'tars',
          module_name: 'tarsAdminRegistry',
          comment: 'poc',
        },
        files: [{ filename: 'evil.tgz', fieldname: 'suse' }],
      },
    });

    await PatchController.uploadAndPublish(ctx);

    assert.deepStrictEqual(mocks.hasOpeAuth.calls, [['tars', 'tarsAdminRegistry', 'devuser']]);
    assert.strictEqual(ctx.makeNotAuthResObj.calls.length, 1);
    assert.strictEqual(mocks.getServerConf.calls.length, 0);
    assert.strictEqual(mocks.addServerPatch.calls.length, 0);
    assert.strictEqual(mocks.addTask.calls.length, 0);
  });

  await test('blocks downloadPackage by package owner auth before streaming package content', async () => {
    mocks.find.setImpl(async () => ({
      id: 11,
      server: 'SecretApp.SecretServer',
      tgz: 'SecretApp.SecretServer_suse_1.tgz',
    }));
    const ctx = createCtx({ paramsObj: { id: 11 } });

    await PatchController.downloadPackage(ctx);

    assert.deepStrictEqual(mocks.hasOpeAuth.calls, [['SecretApp', 'SecretServer', 'devuser']]);
    assert.strictEqual(ctx.makeNotAuthResObj.calls.length, 1);
    assert.strictEqual(mocks.createReadStream.calls.length, 0);
    assert.strictEqual(ctx.set.calls.length, 0);
  });

  await test('blocks deletePatchPackage before delete operations when caller lacks package owner auth', async () => {
    mocks.find.setImpl(async () => ({
      id: 12,
      server: 'SecretApp.SecretServer',
      tgz: 'SecretApp.SecretServer_suse_2.tgz',
    }));
    const ctx = createCtx({ paramsObj: { id: 12 } });

    await PatchController.deletePatchPackage(ctx);

    assert.deepStrictEqual(mocks.hasOpeAuth.calls, [['SecretApp', 'SecretServer', 'devuser']]);
    assert.strictEqual(ctx.makeNotAuthResObj.calls.length, 1);
    assert.strictEqual(mocks.deletePatchFile.calls.length, 0);
    assert.strictEqual(mocks.deleteServerPatchById.calls.length, 0);
  });

  await test('blocks setPatchPackageDefault before default update without operator auth', async () => {
    mocks.find.setImpl(async () => ({
      id: 13,
      server: 'SecretApp.SecretServer',
      tgz: 'SecretApp.SecretServer_suse_3.tgz',
    }));
    const ctx = createCtx({
      paramsObj: {
        id: 13,
        application: 'ClientSuppliedApp',
        module_name: 'ClientSuppliedServer',
      },
    });

    await PatchController.setPatchPackageDefault(ctx);

    assert.deepStrictEqual(mocks.hasOpeAuth.calls, [['SecretApp', 'SecretServer', 'devuser']]);
    assert.strictEqual(ctx.makeNotAuthResObj.calls.length, 1);
    assert.strictEqual(mocks.setPatchPackageDefault.calls.length, 0);
  });

  await test('setPatchPackageDefault uses package record scope after operator auth succeeds', async () => {
    mocks.hasOpeAuth.setImpl(async () => true);
    mocks.find.setImpl(async () => ({
      id: 14,
      server: 'RealApp.RealServer',
      tgz: 'RealApp.RealServer_suse_4.tgz',
    }));
    mocks.setPatchPackageDefault.setImpl(async () => [1]);
    const ctx = createCtx({
      paramsObj: {
        id: 14,
        application: 'ClientSuppliedApp',
        module_name: 'ClientSuppliedServer',
      },
    });

    await PatchController.setPatchPackageDefault(ctx);

    assert.deepStrictEqual(mocks.hasOpeAuth.calls, [['RealApp', 'RealServer', 'devuser']]);
    assert.deepStrictEqual(mocks.setPatchPackageDefault.calls, [[{
      id: 14,
      application: 'RealApp',
      module_name: 'RealServer',
    }]]);
    assert.deepStrictEqual(ctx.body, { data: [1], ret_code: 200, err_msg: '' });
  });
})();
