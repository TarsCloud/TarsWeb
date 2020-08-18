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
const util = require(path.join(cwd, './app/tools/util'));
const ServerService = require(path.join(cwd, './app/service/server/ServerService'));
const DbAccessService = require('../dbaccess/service');
const ServerConfigService = require('./service.js');

const serverConfStruct = {
  id: '',
  application: '',
  server_name: '',
  node_name: '',
  server_type: '',
  enable_set: {
    formatter: value => (value === 'Y'),
  },
  set_name: '',
  set_area: '',
  set_group: '',
  setting_state: '',
  present_state: '',
  bak_flag: {
    formatter: value => (value !== 0),
  },
  template_name: '',
  profile: '',
  async_thread_num: '',
  base_path: '',
  exe_path: '',
  start_script_path: '',
  stop_script_path: '',
  monitor_script_path: '',
  patch_time: { formatter: util.formatTimeStamp },
  patch_version: '',
  process_id: '',
  posttime: { formatter: util.formatTimeStamp },
};

// 额外添加 cache 的字段
Object.assign(serverConfStruct, {
  dcache_server_type: '',
  group_name: '',
  module_name: '',
  app_name: '',
  area: '',
  memory: '',
  shmKey: '',
  cache_version: '',
  apply_id: '',
  routerPageNo: '',
});

const ServerConfigController = {
  /**
   * 获取 cache 服务列表
   * @param ctx
   * @returns {Promise<void>}
   */
  async getCacheServerList(ctx) {
    try {
      const { appName, moduleName } = ctx.paramsObj;
      // 从 opt 获取 cache 服务列表
      const cacheServerList = await ServerConfigService.getCacheServerListFromOpt({ appName, moduleName });
      // 用 cache 的服务名去读 tars 的服务
      const serverNameList = cacheServerList.map(server => `DCache.${server.serverName}`);
      const serverList = await ServerService.getServerNameList({ applicationList: '', serverNameList, allAttr: true });

      // 添加 cache 的服务类型， 是主机、备机还是镜像呢
      serverList.forEach((server) => {
        const server_name = server.get('server_name');
        const cacheServer = cacheServerList.find(item => item.serverName === server_name);

        // console.log(cacheServer);

        server.setDataValue('area', cacheServer.idcArea);
        server.setDataValue('module_name', cacheServer.moduleName);
        server.setDataValue('group_name', cacheServer.groupName);
        server.setDataValue('server_type', cacheServer.serverType);
        server.setDataValue('memory', cacheServer.memSize);
        server.setDataValue('app_name', cacheServer.appName);
        server.setDataValue('cache_version', cacheServer.cacheType);
        server.setDataValue('routerPageNo', cacheServer.routerPageNo);
      });
      ctx.makeResObj(200, '', util.viewFilter(serverList, serverConfStruct));
    } catch (err) {
      logger.error('[getCacheServerList]:', err);
      ctx.makeResObj(500, err.message);
    }
  },
  async getCacheServerListOld(ctx) {
    try {
      const { tree_node_id } = ctx.paramsObj;
      const cacheServerList = await ServerConfigService.getCacheServerList({
        moduleName: tree_node_id,
        attributes: ['apply_id', 'area', 'module_name', 'group_name', 'server_name', 'server_type', 'memory', 'shmKey', 'idc_area'],
        queryBase: ['name'],
        queryModule: ['cache_module_type'],
      });
      const serverNameList = cacheServerList.map(server => `Dcache.${server.server_name}`);
      // 用 cache 的服务名去读 tars 的服务
      const serverList = await ServerService.getServerNameList({ applicationList: '', serverNameList, allAttr: true });
      // 添加 cache 的服务类型， 是主机、备机还是镜像呢
      serverList.forEach((server) => {
        const server_name = server.get('server_name');
        const cacheServer = cacheServerList.find(item => item.server_name === server_name);
        const app_name = cacheServer.get('applyBase').get('name');
        const cache_version = cacheServer.get('moduleBase').get('cache_module_type');
        server.setDataValue('area', cacheServer.get('area'));
        server.setDataValue('module_name', tree_node_id);
        server.setDataValue('group_name', cacheServer.get('group_name'));
        server.setDataValue('server_name', cacheServer.get('server_name'));
        server.setDataValue('server_type', cacheServer.get('server_type'));
        server.setDataValue('memory', cacheServer.get('memory'));
        server.setDataValue('shmKey', cacheServer.get('shmKey'));
        server.setDataValue('idc_area', cacheServer.get('idc_area'));
        server.setDataValue('apply_id', cacheServer.get('apply_id'));
        server.setDataValue('app_name', app_name);
        server.setDataValue('cache_version', cache_version);
      });

      ctx.makeResObj(200, '', util.viewFilter(serverList, serverConfStruct));
    } catch (err) {
      logger.error('[getCacheServerList]:', err);
      ctx.makeResObj(500, err.message);
    }
  },
  addServerConfig: async (ctx) => {
    try {
      const options = [];
      Object.values(ctx.paramsObj.moduleData).forEach((obj) => {
        const { area, apply_id, module_name, group_name, server_name, server_ip, server_type, memory, shmKey, idc_area, status, modify_time, is_docker, template_name, modify_person = ctx.uid } = obj;

        options.push({ area, apply_id, module_name, group_name, server_name, server_ip, server_type, memory, shmKey, idc_area, status, modify_time, is_docker, template_name, modify_person });
      });

      const moduleData = await ServerConfigService.addServerConfig(options);

      if (ctx.paramsObj.dbAccess.servant && ctx.paramsObj.dbAccess.servant != '') {
      const accessData = { module_id, servant, isSerializated, dbMethod, accessDbId, dbaccess_ip, db_num, db_prefix, table_num, table_prefix, db_host, db_port, db_pwd, db_user, db_charset, create_person = ctx.uid } = ctx.paramsObj.dbAccess

      accessData.dbaccess_ip = accessData.dbaccess_ip.join(";");

      if (accessData.dbMethod) {
        const dbAccessMysql = await DbAccessService.getAccessDbById(accessDbId);

  //      console.log(dbAccessMysql);

        accessData.db_host = dbAccessMysql.db_host;
        accessData.db_port = dbAccessMysql.db_port;
        accessData.db_user = dbAccessMysql.db_user;
        accessData.db_pwd = dbAccessMysql.db_pwd;
        accessData.db_charset = dbAccessMysql.db_charset;
      }
      // console.log(accessData);
      const dbAccess = await DbAccessService.createOrUpdate(['module_id'], accessData);

      ctx.makeResObj(200, '', { moduleData, dbAccess } );
      } else {
        ctx.makeResObj(200, '', { moduleData});
      }
    } catch (err) {
      logger.error('[addServerConfig]:', err);
      ctx.makeResObj(500, err.message);
    }
  },
  getServerfigInfo: async (ctx) => {
    try {
      const { moduleId } = ctx.paramsObj;
      const item = await ServerConfigService.getServerConfigInfo({ moduleId });
      ctx.makeResObj(200, '', item);
    } catch (err) {
      logger.error('[getServerConfigInfo]:', err);
      ctx.makeResObj(500, err.message);
    }
  },
  removeServer: async (ctx) => {
    try {
      const { server_name } = ctx.paramsObj;
      const item = await ServerConfigService.removeServer({ server_name });
      ctx.makeResObj(200, '', item);
    } catch (err) {
      logger.error('[removeServer]:', err);
      ctx.makeResObj(500, err.message);
    }
  },
};

module.exports = ServerConfigController;
