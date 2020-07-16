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

// const { getPublishSuccessModuleConfig, removeModuleConfig } = require('./../moduleConfig/service');
const { Console } = require('console');

const ApplyController = {
  getDCacheApp: async (ctx) => {
  },
  dtree: async (ctx) => {
    try {
      if (ctx.paramsObj.type && ctx.paramsObj.type === '1') {
        await TreeService.setCacheData(1)
      }
      // 获取 Dcache 的三个服务
      let tarsDcache = await TreeService.getTreeNodes('', ctx.uid, '2');
      let serverList = [];
      const treeNodeMap = {};
      const rootNode = [];

      // 获取 dache 的router、proxy 服务
      const args = await DCacheOptPrx.loadCacheApp();
      logger.info('[DCacheOptPrx.loadCacheApp]:', args);
      const { __return, cacheApps } = args;
    
      if (__return != 0) {
        return;
        // 如果没有 proxy、router 删除该应用
        }
      cacheApps.forEach((item) => {

        const applyServer = [];

          applyServer.push({
          name: item.routerName,
          id: `1DCache.5${item.routerName}`,
          pid: `1${item.name}`,
            is_parent: false,
            open: false,
            children: [],
            serverType: 'router',
          });

          applyServer.push({
          name: item.proxyName,
          id: `1DCache.5${item.proxyName}`,
          pid: `1${item.name}`,
            is_parent: false,
            open: false,
            children: [],
            serverType: 'proxy',
          });

        // treeNodeMap[id] = server;

      // 获取 cache 服务
        Object.keys(item.cacheModules).forEach((key) => {

          let value = item.cacheModules[key];

          let cacheNodeFloder = {
            name: key,
            id: `1${item.name}.5${key}`,
            pid: `1${item.name}`,
            is_parent: false,
            open: false,
            children: [],
            moduleName: key,
          // 不需要等 await 返回
          };
          applyServer.push(cacheNodeFloder)
        // 把 cache 节点附加上目录树节点
          if(value.cacheServer && value.cacheServer.length > 0) {
            value.cacheServer.forEach(server => {
              cacheNodeFloder.children.push({
                name: server,
                id: `1Dcache.5${server}`,
                pid: `1${value.moduleName}`,
            is_parent: false,
            open: false,
            children: [],
            serverType: 'dcache',
              })
            })
          }
          // 看看该应用是否已经有了存放 cahce 的模块的节点
          if (value.dbAccessServer && value.dbAccessServer.length > 0) {
            cacheNodeFloder.children.push({
              name: value.dbAccessServer,
              id: `1Dcache.5${value.dbAccessServer}`,
              pid: `1${item.name}`,
              is_parent: false,
              open: false,
              children: [],
              serverType: 'dcache',
            })
          }
        });

        serverList = serverList.concat(applyServer);
          return true;
        });

      serverList.forEach((server) => {
        TreeService.parents(treeNodeMap, server, rootNode);
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
  overwriteApply: async (ctx) => {
    try {
      const {
        admin, name, idcArea, setArea,
      } = ctx.paramsObj;
      const create_person = ctx.uid;
      let data = await ApplyService.overwriteApply({
        idc_area: idcArea, set_area: setArea, admin, name, create_person,
      });
      data.hasApply = false;
      ctx.makeResObj(200, '', data);
    } catch (err) {
      logger.error('[overwriteApply]:', err);
      ctx.makeResObj(500, err.message);
    }
  },
  addApply: async (ctx) => {
    try {
      const {
        admin, name, idcArea, setArea,
      } = ctx.paramsObj;
      // const create_person = 'adminUser';
      const create_person = ctx.uid;
      const hasApply = await ApplyService.hasApply({ name });
      if (hasApply) {
        ctx.makeResObj(200, '', { hasApply: true});
      } else {
      // 创建应用
        let data = await ApplyService.addApply({
        idc_area: idcArea, set_area: setArea, admin, name, create_person,
      });

        data.hasApply = false;
      ctx.makeResObj(200, '', data);
      }
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
      const proxyServerIps = [];
      Proxy.forEach((proxy) => {
        // idc_area:"sz"
        // server_ip:""
        proxy.server_ip.split(';').forEach((ip) => {
          if (ip) {
            proxyServerIps.push({
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
          serverIp: [Router.server_ip],
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
          serverIp: proxyServerIps,
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
        const defaultDbAccessPackage = await PatchService.find({
          where: {
            server: 'DCache.CombinDbAccessServer',
            default_version: 1,
          },
        });
        if (!defaultDbAccessPackage) throw new Error('#apply.noDefaultDbAccessPackage#');
        // 发布流程

        // 先发布 proxy
        let releaseInfoOption = new TarsStream.List(DCacheOptStruct.ReleaseInfo);
        let releaseArr = [];
        Proxy.forEach((proxy) => {
          proxy.server_ip.split(";").forEach((serverIp) => {
          const releaseInfo = new DCacheOptStruct.ReleaseInfo();
          releaseInfo.readFromObject({
            appName: 'DCache',
            serverName: proxy.server_name,
              nodeName: serverIp,
            groupName: 'ProxyServer',
            version: `${defaultProxyPackage.id}`,
              user: ctx.uid,
            md5: '',
            status: 0,
            error: '',
            ostype: '',
          });
          releaseArr.push(releaseInfo);
          })
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
          user: ctx.uid,
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
  loadRouterDb: async (ctx) => {
    try {
      const router = await ApplyService.getRouterDb();
      let data = [];
      router.forEach((item) => {
        data.push({ id: item.dataValues.id, router_db_flag: item.dataValues.router_db_flag});
      })
      ctx.makeResObj(200, '', data);
    } catch (err) {
      logger.error('[loadRouterDb]:', err);
      ctx.makeResObj(500, err.message);
    }    
  },
  getApplyAndRouterAndProxy: async (ctx) => {
    try {
      const { applyId } = ctx.paramsObj;
      const queryRouter = ['id', 'apply_id', 'server_name', 'server_ip', 'template_file', 'router_db_name', 'router_db_ip', 'router_db_port', 'router_db_user', 'router_db_pass', 'create_person'];
      const queryProxy = ['id', 'apply_id', 'server_name', 'server_ip', 'template_file', 'idc_area', 'create_person'];
      const data = await ApplyService.getApply({ applyId, queryRouter, queryProxy });
      data.Proxy.forEach((item) => {
        item.server_ip = item.server_ip.split(";").filter((x) => { return x && x != ''; });
      });      
      ctx.makeResObj(200, '', data);
    } catch (err) {
      logger.error('[getApplyAndRouterAndProxy]:', err);
      ctx.makeResObj(500, err.message);
    }
  },
  saveRouterProxy: async (ctx) => {
    try {
      const { Proxy, Router, dbMethod, routerDbId } = ctx.paramsObj;
      Proxy.forEach((item) => {
        item.server_ip = item.server_ip.join(";");
      });
      if (dbMethod) {
        const data = await ApplyService.getRouterDbById(routerDbId);
        Router.router_db_ip = data.router_db_ip;
        Router.router_db_pass = data.router_db_pass;
        Router.router_db_port = data.router_db_port;
        Router.router_db_user = data.router_db_user;
      } 
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
