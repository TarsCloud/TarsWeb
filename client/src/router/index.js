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

Vue.use(Router);

// 重写路由的push方法
const routerPush = Router.prototype.push;
Router.prototype.push = function push(location) {
  return routerPush.call(this, location).catch(error => error)
}

const routerReplace = Router.prototype.replace;
Router.prototype.replace = function replace(location) {
  return routerReplace.call(this, location).catch(error => error)
}

// 服务管理
import Server from '@/pages/server/index';
import ServerManage from '@/pages/server/manage';
import ServerPublish from '@/pages/server/publish';
import ServerConfig from '@/pages/server/config';

import AuthManage from '@/common/user-manage';
// import InterfaceDebuger from '@/common/interface-debuger';
import ServerServerMonitor from '@/common/monitor-server';
import ServerPropertyMonitor from '@/common/monitor-property';

// 运维管理
import Operation from '@/pages/operation/index';
import OperationDeploy from '@/pages/operation/deploy';
import OperationExpand from '@/pages/operation/expand';
import OperationTemplates from '@/pages/operation/templates';
import OperationNodes from '@/pages/operation/nodes';
import OperationCheck from '@/pages/operation/check';
import OperationApplication from '@/pages/operation/application';
import OperationBusiness from '@/pages/operation/business';
import OperationBusinessRelation from '@/pages/operation/businessRelation';
import OperationIDCManage from '@/pages/operation/idc';
import OperationImage from '@/pages/operation/image';

import PluginsManage from '@/common/plugins-manage.vue';
//服务级别插件
import ServerPlugins from '@/common/serverPlugins';
//运维级别插件
import OperationPlugins from '@/common/operationPlugins';
//全局插件
import Plugin from '@/common/plugins.vue';

//市场
import Market from '@/market/market';

const getComponent = (component) => {
    return {
        default: component,
        market: Market,
    }
}
export default new Router({
  routes: [{
      path: '/server',
      name: 'Server',
      components: getComponent(Server),
      children: [{
          path: ':treeid/manage',
          component: ServerManage,
        },
        {
          path: ':treeid/publish',
          component: ServerPublish,
        },
        {
          path: ':treeid/config',
          component: ServerConfig,
        },
        {
          path: ':treeid/server-monitor',
          component: ServerServerMonitor,
        },
        {
          path: ':treeid/property-monitor',
          component: ServerPropertyMonitor,
        },
        {
          path: ':treeid/user-manage',
          component: AuthManage,
        },
        {
          path: ':treeid/plugins',
          component: ServerPlugins,
        },
      ],
    },
    {
      path: '/operation',
      name: 'Operation',
      components: getComponent(Operation),
      redirect: '/operation/deploy',
      children: [{
          path: 'deploy',
          component: OperationDeploy,
        },
        {
          path: 'expand',
          component: OperationExpand,
        },
        {
          path: 'templates',
          component: OperationTemplates,
        },
        {
          path: 'nodes',
          component: OperationNodes,
        },
        {
          path: 'check',
          component: OperationCheck,
        },
        {
          path: 'application',
          component: OperationApplication,
        },
        {
          path: 'business',
          component: OperationBusiness,
        },
        {
          path: 'businessRelation',
          component: OperationBusinessRelation,
        },
        {
          path: 'idc',
          component: OperationIDCManage,
        },
        {
          path: 'image',
          component: OperationImage
        },
        {
          path: 'plugins/*',
          component: OperationPlugins,
        },
      ],
    },
    {
      path: '/market',
      name: 'Market',
      components: {
            market: Market
      }
    },
    {
      path: '/plugins/*',
      name: 'Plugin',
      components: getComponent(Plugin)
    },
    {
      path: '/plugins-manage',
      name: 'PluginManage',
      components: getComponent(PluginsManage)
    },

    {
      path: '*',
      redirect: '/server',
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    return {
      x: 0,
      y: 0
    }
  }
});