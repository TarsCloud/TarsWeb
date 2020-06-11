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
const TarsStream = require('@tars/stream');

const logger = require(path.join(cwd, './app/logger'));

const PatchService = require(path.join(cwd, './app/service/patch/PatchService'));
const TreeService = require(path.join(cwd, './app/service/server/TreeService'));

const { DCacheOptPrx, DCacheOptStruct } = require(path.join(cwd, './app/service/util/rpcClient'));

const ApplyService = require('./service');

const { getPublishSuccessModuleConfig, removeModuleConfig } = require('./../moduleConfig/service');

const ApplyController = {
  dtree: async (ctx) => {
    try {
      // 获取 Dcache 的三个服务
      let tarsDcache = await TreeService.getTreeNodes(ctx.uid, '', ['DCache.DCacheOptServer', 'DCache.ConfigServer', 'DCache.PropertyServer']);
      let serverList = [];
      const treeNodeMap = {};
      const rootNode = [];

      // 获取 dache 的router、proxy 服务
      const applys = await ApplyService.getApplyList({
        queryRouter: ['server_name'],
        queryProxy: ['server_name'],
        raw: false,
      });
      applys.forEach((item) => {
        const {
          id,
          name,
        } = item.dataValues;
        const RouterServer_name = item.get('Router') ? item.get('Router').get('server_name') : '';
        const ProxyServer_name = item.get('Proxy')[0] ? item.get('Proxy')[0].get('server_name') : '';

        // 如果没有 proxy、router 删除该应用
        if (!RouterServer_name && !ProxyServer_name) {
          return ApplyService.removeApply({ id });
        }

        const applyServer = [];
        if (RouterServer_name) {
          applyServer.push({
            name: RouterServer_name,
            id: `1DCache.5${RouterServer_name}`,
            pid: `1${name}`,
            is_parent: false,
            open: false,
            children: [],
            serverType: 'router',
          });
        }
        if (ProxyServer_name) {
          applyServer.push({
            name: ProxyServer_name,
            id: `1DCache.5${ProxyServer_name}`,
            pid: `1${name}`,
            is_parent: false,
            open: false,
            children: [],
            serverType: 'proxy',
          });
        }
        serverList = serverList.concat(applyServer);
        return true;
      });
      serverList.forEach((server) => {
        // treeNodeMap[id] = server;
        TreeService.parents(treeNodeMap, server, rootNode);
      });

      // 获取 cache 服务
      const cacheServers = await getPublishSuccessModuleConfig();
      cacheServers.forEach((cacheServerItem) => {
        const cacheServer = cacheServerItem.get({ plain: true });
        // 看看存不存在该应用， 不存在就返回
        const applyNode = rootNode.find(node => node.name === cacheServer.AppBase.name);
        if (!applyNode) return false;

        // 如果模块服务全部下线了， 删除该模块基本信息  删除表信息  t_apply_cache_module_conf、t_apply_cache_module_base(预留先不删) 的信息
        if (cacheServer.ServerConf.length === 0) {
          // 不需要等 await 返回
          removeModuleConfig(cacheServer);
        }

        // 把 cache 节点附加上目录树节点
        cacheServer.ServerConf.forEach((server) => {
          const cacheNode = {
            name: server.server_name,
            id: `1Dcache.5${server.server_name}`,
            pid: `1${cacheServer.AppBase.name}`,
            is_parent: false,
            open: false,
            children: [],
            serverType: 'dcache',
            // moduleName: server.module_name
          };

          // 看看该应用是否已经有了存放 cahce 的模块的节点
          let moduleNode = applyNode.children.find(item => item.name === server.module_name);
          if (!moduleNode) {
            moduleNode = {
              name: server.module_name,
              id: `1Dcache.5${server.module_name}`,
              pid: `1${cacheServer.AppBase.name}`,
              is_parent: false,
              open: false,
              children: [],
              moduleName: server.module_name,
            };
            applyNode.children.push(moduleNode);
          }
          moduleNode.children.push(cacheNode);
          return true;
        });
        return true;
      });


      tarsDcache = tarsDcache.concat(rootNode);


      ctx.makeResObj(200, '', tarsDcache);
    } catch (e) {
      logger.error('[dtree]', e, ctx);
      ctx.makeResObj(500, e.message, {});
    }
  },
  async getPublishSuccessModuleConfig(ctx) {
    ctx.makeResObj(200, '', await getPublishSuccessModuleConfig());
  },
  getApplyList: async (ctx) => {
    try {
      const applys = await ApplyService.getApplyList();
      ctx.makeResObj(200, '', applys);
    } catch (err) {
      logger.error('[getApplyList]:', err);
      ctx.makeErrResObj();
    }
  },
  addApply: async (ctx) => {
    try {
      const {
        admin, name, idcArea, setArea,
      } = ctx.paramsObj;
      const create_person = 'adminUser';
      // 创建应用
      const data = await ApplyService.addApply({
        idc_area: idcArea, set_area: setArea, admin, name, create_person,
      });

      ctx.makeResObj(200, '', data);
    } catch (err) {
      logger.error('[addApply]:', err);
      ctx.makeResObj(500, err.message);
    }
  },
  installAndPublish: async (ctx) => {
    try {
      const { applyId } = ctx.paramsObj;
      const queryRouter = ['id', 'apply_id', 'server_name', 'server_ip', 'template_file', 'router_db_name', 'router_db_ip', 'router_db_port', 'router_db_user', 'router_db_pass', 'create_person'];
      const queryProxy = ['id', 'apply_id', 'server_name', 'server_ip', 'template_file', 'idc_area', 'create_person'];
      const apply = await ApplyService.getApply({ applyId, queryRouter, queryProxy });
      const { name, Router, Proxy } = apply;
      const serverIp = [];
      Proxy.forEach((proxy) => {
        // idc_area:"sz"
        // server_ip:""
        proxy.server_ip.split(';').forEach((ip) => {
          if (ip) {
            serverIp.push({
              ip,
              idcArea: proxy.idc_area,
            });
          }
        });
      });
      const option = new DCacheOptStruct.InstallAppReq();
      option.readFromObject({
        appName: name,
        routerParam: {
          installRouter: true,
          serverName: `DCache.${Router.server_name}`,
          appName: name,
          serverIp: Router.server_ip.split(';'),
          templateFile: Router.template_file,
          dbName: Router.router_db_name,
          dbIp: Router.router_db_ip,
          dbPort: Router.router_db_port,
          dbUser: Router.router_db_user,
          dbPwd: Router.router_db_pass,
          remark: '',
        },
        proxyParam: {
          installProxy: true,
          serverName: `DCache.${Proxy[0].server_name}`,
          appName: name,
          serverIp,
          templateFile: Proxy[0].template_file,
        },
        version: '1.0',
        replace: apply.status === 2,
      });
      const args = await DCacheOptPrx.installApp(option);
      logger.info('[DCacheOptPrx.installApp]:', args);
      // {"__return":0,"instalRsp":{"errMsg":""}}
      const { __return, instalRsp } = args;
      if (__return === 0) {
        //  安装成功， 应用进入目录树
        await apply.update({ status: 2 });

        // 先获取发布包id
        const defaultProxyPackage = await PatchService.find({
          where: {
            server: 'DCache.ProxyServer',
            default_version: 1,
          },
        });
        if (!defaultProxyPackage) throw new Error('#apply.noDefaultProxyPackage#');
        const defaultRouterPackage = await PatchService.find({
          where: {
            server: 'DCache.RouterServer',
            default_version: 1,
          },
        });
        if (!defaultRouterPackage) throw new Error('#apply.noDefaultRouterPackage#');
        // 发布流程

        // 先发布 proxy
        let releaseInfoOption = new TarsStream.List(DCacheOptStruct.ReleaseInfo);
        let releaseArr = [];
        Proxy.forEach((proxy) => {
          const releaseInfo = new DCacheOptStruct.ReleaseInfo();
          releaseInfo.readFromObject({
            appName: 'DCache',
            serverName: proxy.server_name,
            nodeName: proxy.server_ip,
            groupName: 'ProxyServer',
            version: `${defaultProxyPackage.id}`,
            user: 'adminUser',
            md5: '',
            status: 0,
            error: '',
            ostype: '',
          });
          releaseArr.push(releaseInfo);
        });
        releaseInfoOption.readFromObject(releaseArr);
        const argsProxy = await DCacheOptPrx.releaseServer(releaseInfoOption);
        // {"__return":0,"releaseRsp":{"releaseId":1,"errMsg":"sucess to release server"}}
        logger.info('[DCacheOptPrx.publishApp] argsProxy:', argsProxy);
        if (argsProxy.__return !== 0) {
          throw new Error(argsProxy.releaseRsp.errMsg);
        }

        // 发布 router
        releaseInfoOption = new TarsStream.List(DCacheOptStruct.ReleaseInfo);
        const releaseInfo = new DCacheOptStruct.ReleaseInfo();
        releaseArr = [];
        releaseInfo.readFromObject({
          appName: 'DCache',
          serverName: Router.server_name,
          nodeName: Router.server_ip,
          groupName: 'RouterServer',
          version: `${defaultRouterPackage.id}`,
          user: 'adminUser',
          md5: '',
          status: 0,
          error: '',
          ostype: '',
        });
        releaseArr.push(releaseInfo);
        releaseInfoOption.readFromObject(releaseArr);
        const argsRouter = await DCacheOptPrx.releaseServer(releaseInfoOption);
        logger.info('[DCacheOptPrx.publishApp] argsRouter:', argsRouter);
        // {"__return":0,"releaseRsp":{"releaseId":1,"errMsg":"sucess to release server"}}
        if (argsRouter.__return !== 0) {
          // 发布失败
          throw new Error(argsRouter.releaseRsp.errMsg);
        }
        ctx.makeResObj(200, '', {
          proxy: argsProxy.releaseRsp,
          router: argsRouter.releaseRsp,
        });
      } else {
        // 安装失败
        throw new Error(instalRsp.errMsg);
      }
    } catch (err) {
      logger.error('[installAndPublish]:', err);
      ctx.makeResObj(500, err.message);
    }
  },
  getApplyAndRouterAndProxy: async (ctx) => {
    try {
      const { applyId } = ctx.paramsObj;
      const queryRouter = ['id', 'apply_id', 'server_name', 'server_ip', 'template_file', 'router_db_name', 'router_db_ip', 'router_db_port', 'router_db_user', 'router_db_pass', 'create_person'];
      const queryProxy = ['id', 'apply_id', 'server_name', 'server_ip', 'template_file', 'idc_area', 'create_person'];
      const data = await ApplyService.getApply({ applyId, queryRouter, queryProxy });
      ctx.makeResObj(200, '', data);
    } catch (err) {
      logger.error('[getApplyAndRouterAndProxy]:', err);
      ctx.makeResObj(500, err.message);
    }
  },
  saveRouterProxy: async (ctx) => {
    try {
      const { Proxy, Router } = ctx.paramsObj;
      await ApplyService.saveRouterProxy({ Proxy, Router });
      ctx.makeResObj(200, '', {});
    } catch (err) {
      logger.error('[saveRouterProxy]:', err);
      ctx.makeResObj(500, err.message);
    }
  },
  hasModule: async (ctx) => {
    try {
      const { serverType, serverName } = ctx.paramsObj;
      const hasModule = await ApplyService.hasModule({ serverType, serverName });
      ctx.makeResObj(200, '', hasModule);
    } catch (err) {
      logger.error('[hasModule]:', err);
      ctx.makeResObj(500, err.message);
    }
  },
};

module.exports = ApplyController;
