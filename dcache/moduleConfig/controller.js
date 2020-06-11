/**
 * Tencent is pleased to support the open source community by making Tars available.
 *
 * Copyright (C) 2016THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the BSD 3-Clause License (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * https://opensource.org/licenses/BSD-3-Clause
 *
 * Unless required by applicable law or agreed to in writing, software distributed
 * under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

const cwd = process.cwd();
const path = require('path');

const logger = require(path.join(cwd, './app/logger'));
const TarsStream = require('@tars/stream');
const ApplyService = require('./../apply/service.js');
const ModuleConfigService = require('./service.js');

const PatchService = require(path.join(cwd, './app/service/patch/PatchService'));
const { DCacheOptPrx, DCacheOptStruct } = require(path.join(cwd, './app/service/util/rpcClient'));

function mapCacheType(key) {
  if (key === 1) return 'hash';
  if (key === 2) return 'list';
  if (key === 3) return 'set';
  return 'zset';
}

const ModuleConfigController = {
  addModuleConfig: async (ctx) => {
    try {
      const {
        admin,
        cache_module_type,
        cache_type,
        dbAccessServant,
        idc_area,
        key_type,
        max_read_flow,
        max_write_flow,
        apply_id,
        module_id,
        module_name,
        module_remark,
        per_record_avg,
        set_area,
        total_record,
      } = ctx.paramsObj;
      const create_person = 'adminUser';
      const option = {
        admin,
        cache_module_type: +cache_module_type || 0,
        cache_type,
        dbAccessServant,
        idc_area,
        key_type: +key_type || 0,
        max_read_flow,
        max_write_flow,
        apply_id,
        module_id,
        module_name,
        module_remark,
        per_record_avg,
        set_area,
        total_record,
        create_person,
      };
      const item = await ModuleConfigService.addModuleConfig(option);
      ctx.makeResObj(200, '', item);
    } catch (err) {
      logger.error('[addModuleConfig]:', err);
      ctx.makeResObj(500, err.message);
    }
  },
  getModuleConfigInfo: async (ctx) => {
    try {
      const { moduleId } = ctx.paramsObj;
      const queryModuleBase = ['cache_version', 'mkcache_struct', 'follower'];
      const item = await ModuleConfigService.getModuleConfigInfo({ moduleId, queryModuleBase });
      ctx.makeResObj(200, '', item);
    } catch (err) {
      logger.error('[getModuleConfigInfo]:', err);
      ctx.makeErrResObj();
    }
  },
  getModuleConfigAndServerInfo: async (ctx) => {
    try {
      const { moduleId } = ctx.paramsObj;
      const queryModuleBase = ['cache_version', 'mkcache_struct', 'follower'];
      const queryServerConf = ['id', 'area', 'apply_id', 'module_name', 'group_name', 'server_name', 'server_ip', 'server_type', 'memory', 'shmKey', 'status', 'is_docker', 'template_name'];

      const item = await ModuleConfigService.getModuleConfigInfo({ moduleId, queryModuleBase, queryServerConf });
      ctx.makeResObj(200, '', item);
    } catch (err) {
      logger.error('[getModuleConfigAndServerInfo]:', err);
      ctx.makeErrResObj();
    }
  },
  installAndPublish: async (ctx) => {
    try {
      let { moduleId, mkCache } = ctx.paramsObj;
      const queryModuleBase = ['cache_version', 'mkcache_struct', 'follower'];
      const queryServerConf = ['id', 'area', 'module_name', 'group_name', 'server_name', 'server_ip', 'server_type', 'memory', 'shmKey', 'status', 'is_docker', 'template_name'];
      const moduleInfo = await ModuleConfigService.getModuleConfigInfo({ moduleId, queryModuleBase, queryServerConf });
      const {
        apply_id, module_name, ServerConf, per_record_avg, ModuleBase, dbAccessServant, cache_module_type, key_type,
      } = moduleInfo;
      const applyInfo = await ApplyService.getApply({ applyId: apply_id });
      const isMKCache = ModuleBase.cache_version === 2;
      const CacheHost = [];
      const releaseInfoOption = new TarsStream.List(DCacheOptStruct.ReleaseInfo);
      const releaseArr = [];
      let args;
      mkCache = mkCache && JSON.parse(mkCache);
      // 先获取发布包id
      const defaultCachePackage = await PatchService.find({
        where: {
          package_type: ModuleBase.cache_version,
          server: 'DCache.DCacheServerGroup',
          default_version: 1,
        },
      });
      if (!defaultCachePackage) throw new Error('#module.noDefaultCachePackage#');

      // 主机、镜像、备机
      const optServerType = ['M', 'S', 'I'];
      ServerConf.forEach((item) => {
        // for install use
        const host = new DCacheOptStruct.CacheHostParam();
        host.readFromObject({
          serverName: `DCache.${item.server_name}`,
          serverIp: item.server_ip,
          templateFile: item.template_name || 'tars.default',
          type: optServerType[item.server_type],
          bakSrcServerName: item.server_type ? `DCache.${ServerConf[0].server_name}` : '',
          idc: item.area,
          priority: item.server_type ? '2' : '1',
          groupName: item.group_name,
          shmSize: item.memory.toString(),
          // 共享内存key?
          shmKey: item.shmKey,
          isContainer: (!!item.is_docker).toString(),
        });
        CacheHost.push(host);

        // for publish use
        const releaseInfo = new DCacheOptStruct.ReleaseInfo();
        releaseInfo.readFromObject({
          appName: 'DCache',
          serverName: item.server_name,
          nodeName: item.server_ip,
          groupName: 'DCacheServerGroup',
          version: defaultCachePackage.id.toString(),
          user: 'adminUser',
          md5: '',
          status: 0,
          error: '',
          ostype: '',
        });
        releaseArr.push(releaseInfo);
      });
      if (!isMKCache) {
        // 一期模块
        const kvCacheConf = new DCacheOptStruct.SingleKeyConfParam();
        kvCacheConf.readFromObject({
          avgDataSize: per_record_avg.toString(),
          readDbFlag: 'Y',
          enableErase: key_type === 3 ? 'Y' : 'N',
          eraseRadio: '95%',
          saveOnlyKey: 'N',
          dbFlag: cache_module_type === 2 ? 'Y' : 'N',
          dbAccessServant: cache_module_type === 2 ? dbAccessServant : '',
          startExpireThread: key_type === 2 ? 'Y' : 'N',
          expireDb: 'Y',
          hotBackupDays: '3',
          coldBackupDays: '3',
        });
        const option = new DCacheOptStruct.InstallKVCacheReq();
        option.readFromObject({
          appName: applyInfo.name,
          moduleName: module_name,
          kvCacheHost: CacheHost,
          kvCacheConf,
          version: ModuleBase.cache_version.toString(),
          replace: moduleInfo.status === 2,
        });
        args = await DCacheOptPrx.installKVCacheModule(option);
      } else {
        // 二期模块
        const mkvCacheConf = new DCacheOptStruct.MultiKeyConfParam();
        mkvCacheConf.readFromObject({
          avgDataSize: per_record_avg.toString(),
          readDbFlag: 'Y',
          enableErase: key_type === 3 ? 'Y' : 'N',
          eraseRadio: '95%',
          saveOnlyKey: 'N',
          dbFlag: cache_module_type === 2 ? 'Y' : 'N',
          dbAccessServant: cache_module_type === 2 ? dbAccessServant : '',
          startExpireThread: key_type === 2 ? 'Y' : 'N',
          expireDb: 'Y',
          cacheType: mapCacheType(ModuleBase.mkcache_struct),
          hotBackupDays: '3',
          coldBackupDays: '3',
        });
        // map param vector<RecordParam> fieldParam
        const fieldParam = [];
        mkCache.mainKey.forEach((item) => {
          const record = new DCacheOptStruct.RecordParam();
          record.readFromObject({
            fieldName: item.fieldName,
            keyType: item.keyType,
            dataType: item.dataType,
            property: item.property,
            defaultValue: item.defaultValue,
            maxLen: item.maxLen,
          });
          fieldParam.push(record);
        });
        if (ModuleBase.mkcache_struct === 1) {
          mkCache.unionKey.forEach((item) => {
            const record = new DCacheOptStruct.RecordParam();
            record.readFromObject({
              fieldName: item.fieldName,
              keyType: item.keyType,
              dataType: item.dataType,
              property: item.property,
              defaultValue: item.defaultValue,
              maxLen: item.maxLen,
            });
            fieldParam.push(record);
          });
        }
        mkCache.value.forEach((item) => {
          const record = new DCacheOptStruct.RecordParam();
          record.readFromObject({
            fieldName: item.fieldName,
            keyType: item.keyType,
            dataType: item.dataType,
            property: item.property,
            defaultValue: item.defaultValue,
            maxLen: item.maxLen,
          });
          fieldParam.push(record);
        });
        const option = new DCacheOptStruct.InstallMKVCacheReq();
        option.readFromObject({
          appName: applyInfo.name,
          moduleName: module_name,
          mkvCacheHost: CacheHost,
          mkvCacheConf,
          fieldParam,
          version: ModuleBase.cache_version.toString(),
          replace: moduleInfo.status === 2,
        });
        args = await DCacheOptPrx.installMKVCacheModule(option);
      }
      // 安装成功， 进入发布
      if (args.__return === 0) {
        // 应用进入目录树
        await moduleInfo.update({ status: 2 });

        releaseInfoOption.readFromObject(releaseArr);
        const argsPublish = await DCacheOptPrx.releaseServer(releaseInfoOption);
        logger.info('[DCacheOptPrx.publishApp]:', argsPublish);
        if (argsPublish.__return !== 0) {
          // 发布失败
          throw new Error(argsPublish.releaseRsp.errMsg);
        }
        ctx.makeResObj(200, '', {
          releaseRsp: argsPublish.releaseRsp,
        });
      } else {
        // 安装失败
        const { errMsg } = args.kvCacheRsp || args.mkvCacheRsp;
        throw new Error(errMsg);
      }
    } catch (err) {
      logger.error('[installAndPublish]:', err);
      ctx.makeResObj(500, err.message);
    }
  },
  /**
   *  获取发布进度
   *  @param ctx
   * @returns {Promise.<void>}
   * */
  getReleaseProgress: async (ctx) => {
    try {
      const { releaseId } = ctx.paramsObj;
      const { progress, percent } = await ModuleConfigService.getReleaseProgress(releaseId);
      ctx.makeResObj(200, '', { progress, percent });
    } catch (err) {
      logger.error('[getReleaseProgress]:', err);
      ctx.makeResObj(500, err.message);
    }
  },
};

module.exports = ModuleConfigController;
