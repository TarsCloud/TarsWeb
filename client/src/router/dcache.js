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

import Vue from 'vue';
import Router from 'vue-router';

// 服务管理
import Server from '@/pages/server/dcacheIndex';

// import ServerManage from '@/pages/server/manage';
import dcacheServerManage from '@/pages/server/dcacheManage.vue';
import dcacheModuleManage from '@/pages/dcache/moduleManage/index.vue';
import PropertyMonitor from '@/pages/dcache/propertyMonitor/index.vue'

// import ServerPublish from '@/pages/server/publish';
import ServerPublish from '@/pages/server/dcachePublish';
import ServerConfig from '@/pages/server/config';
import ServerServerMonitor from '@/pages/server/monitor-server';
import ServerPropertyMonitor from '@/pages/server/monitor-property';
import userManage from '@/pages/server/user-manage';
import InterfaceDebuger from '@/pages/server/interface-debuger';

// dcache 运维管理
import Operation from '@/pages/dcacheOperation/index';
import Apply from '@/pages/dcacheOperation/apply/index';
import CreateApply from '@/pages/dcacheOperation/apply/createApply';
import CreateService from '@/pages/dcacheOperation/apply/createService.vue';
import installAndPublish from '@/pages/dcacheOperation/apply/installAndPublish.vue';
import Module from '@/pages/dcacheOperation/module/index.vue';
import CreateModule from '@/pages/dcacheOperation/module/CreateModule.vue';
import ModuleConfig from '@/pages/dcacheOperation/module/ModuleConfig.vue';
import ModuleServerConfig from '@/pages/dcacheOperation/module/ServerConfig.vue';
import ModuleInstallAndPublish from '@/pages/dcacheOperation/module/InstallAndPublish.vue';
import Region from '@/pages/dcacheOperation/region';

// 发布包管理
import releasePackage from '@/pages/releasePackage/index';
import proxyList from '@/pages/releasePackage/proxyList';
import accessList from '@/pages/releasePackage/accessList';
import routerList from '@/pages/releasePackage/routerList';
import cacheList from '@/pages/releasePackage/cacheList';

// cache 配置中心
import CacheConfig from '@/pages/cacheConfig/config'
import ModuleCache from '@/pages/cacheConfig/moduleCache'

// 操作管理
import OperationManage from '@/pages/dcache/operationManage/index.vue'
import OperationManageTypeList from '@/pages/dcache/operationManage/typeList.vue'
import MainBackup from '@/pages/dcache/operationManage/mainBackup.vue'
import OperationManageRouter from '@/pages/dcache/routerManage/index'
import OperationManageRouterModule from '@/pages/dcache/routerManage/module'
import OperationManageRouterRecord from '@/pages/dcache/routerManage/record'
import OperationManageRouterGroup from '@/pages/dcache/routerManage/group'
import OperationManageRouterServer from '@/pages/dcache/routerManage/server'
import OperationManageRouterTransfer from '@/pages/dcache/routerManage/transfer'


Vue.use(Router);

export default new Router({
    routes: [{
      path: '/server',
      name: 'Server',
      component: Server,
            children: [{
          path: ':treeid/manage',
          component: dcacheServerManage,
        },
        {
          path: ':treeid/manage/:serverType',
          component: dcacheServerManage,
        },
        {
          path: ':treeid/publish/:serverType',
          component: ServerPublish,
        },
        {
          path: ':treeid/config/:serverType',
          component: ServerConfig,
        },
        {
          path: ':treeid/server-monitor/:serverType',
          component: ServerServerMonitor,
        },
        {
          path: ':treeid/property-monitor/:serverType',
          component: ServerPropertyMonitor,
        },
        {
          path: ':treeid/interface-debuger/:serverType',
          component: InterfaceDebuger,
        },
        {
          path: ':treeid/user-manage/:serverType',
          component: userManage,
        },
        {
          path: ':treeid/cache',
          component: dcacheModuleManage,
        },
        {
          path: ':treeid/moduleCache',
          component: ModuleCache,
        },
        {
          path: ':treeid/propertyMonitor',
          component: PropertyMonitor,
          fn: '特性监控',
        },
      ],
    },
    {
      path: '/operation',
      name: 'Operation',
      component: Operation,
      redirect: '/operation/apply',
            children: [{
          path: 'apply',
          name: 'apply',
          component: Apply,
          redirect: '/operation/apply/createApply',
          children: [
            {
              path: 'createApply',
              component: CreateApply,
            },
            {
              path: 'createService/:applyId',
              component: CreateService,
            },
            {
              path: 'installAndPublish/:applyId',
              component: installAndPublish,
            },
          ]
        },
        {
          path: 'module',
          component: Module,
          redirect: '/operation/module/createModule',
          children: [
            {
              path: 'createModule',
              component: CreateModule,
            },
            {
              path: 'moduleConfig/:moduleId',
              component: ModuleConfig,
            },
            {
              path: 'serverConfig/:moduleId',
              component: ModuleServerConfig,
            },
            {
              path: 'installAndPublish/:moduleId',
              component: ModuleInstallAndPublish,
            },
          ]
        },
        {
          path: 'region',
          name: 'region',
          component: Region,
        },
      ],
    },
    {
      path: '/releasePackage',
      name: 'releasePackage',
      component: releasePackage,
      redirect: '/releasePackage/proxyList',
      children: [
        {
          path: 'proxyList',
          component: proxyList,
        },
        {
          path: 'accessList',
          component: accessList,
        },
        {
          path: 'routerList',
          component: routerList,
        },
        {
          path: 'cacheList',
          component: cacheList,
        },
      ],
    },
    {
      path: '/config',
      component: CacheConfig
    },
    {
      path: '/operationManage',
      name: 'operationManage',
      component: OperationManage,
      redirect: '/operationManage/expand',
      children: [
        {
          path: 'mainBackup',
          component: MainBackup,
        },
        {
                    path: 'router',
                    component: OperationManageRouter,
                    children: [
                        {
                            path: ':treeid/module',
                            component: OperationManageRouterModule,
                        },
                        {
                            path: ':treeid/record',
                            component: OperationManageRouterRecord,
                        },
                        {
                            path: ':treeid/group',
                            component: OperationManageRouterGroup,
                        },
                        {
                            path: ':treeid/server',
                            component: OperationManageRouterServer,
                        },
                        {
                            path: ':treeid/transfer',
                            component: OperationManageRouterTransfer,
                        },
                    ]
                },
                {
          path: ':type',
          component: OperationManageTypeList,
        },
      ],
    },
    {
      path: '*',
      redirect: '/server',
    },
  ],
  scrollBehavior (to, from, savedPosition) {
    return {x: 0, y: 0}
  }
});
