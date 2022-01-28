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

// 重写路由的push方法
const routerPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return routerPush.call(this, location).catch(error => error)
}

// 服务管理
import Server from '@/k8s/server/index';
import ServerManage from '@/k8s/server/manage';
import HistoryManage from '@/k8s/server/history';
import ServerPublish from '@/k8s/server/publish';
import ServerConfig from '@/k8s/server/config';

// import AlarmConfig from '@/common/alarm';
import AuthManage from '@/common/user-manage';
import InterfaceDebuger from '@/common/interface-debuger';
import ServerServerMonitor from '@/common/monitor-server';
import ServerPropertyMonitor from '@/common/monitor-property';

// 运维管理
import Operation from '@/k8s/operation/index';
import OperationDeploy from '@/k8s/operation/deploy';
import OperationApproval from '@/k8s/operation/approval';
import OperationHistory from '@/k8s/operation/history';
import OperationUndeploy from '@/k8s/operation/undeploy';
import OperationTemplates from '@/k8s/operation/templates';
import OperationImage from '@/k8s/operation/image';
import OperationAffinity from '@/k8s/operation/affinity';
import OperationApplication from '@/k8s/operation/application';
import OperationBusiness from '@/k8s/operation/business';
import OperationNode from '@/k8s/operation/node';
import OperationEvent from '@/k8s/operation/event';
import OperationTfc from '@/k8s/operation/frameworkConfig';

// 网关
import OperationGateway from '@/gateway/index';

// // 市场
// import MarketIndex from '@/market/index';
// import Market from '@/market/market';
// import List from '@/market/service/list';
// import ServiceInfo from '@/market/service/index';

// import Login from '@/market/user/login';
// import Register from '@/market/user/register';
// import Activate from '@/market/user/activate';
// import Forget from '@/market/user/forget';
// import ModifyPass from '@/market/user/modifyPass';
// import ResetPass from '@/market/user/resetPass';

// import RepoPass from '@/market/repository/repoPass';
// import ListProject from '@/market/repository/index';

// 市场
import {
  marketSso,
  marketRepo,
  marketService,
  marketList
} from './inc/market';

import VueRouter from 'vue-router';

Vue.use(Router);

export default new Router({
  routes: [{
      path: '/server',
      name: 'Server',
      component: Server,
      children: [{
          path: ':treeid/manage',
          component: ServerManage,
        },
        {
          path: ':treeid/history',
          component: HistoryManage,
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
          path: ':treeid/interface-debuger',
          component: InterfaceDebuger,
        },
        {
          path: ':treeid/user-manage',
          component: AuthManage,
        },
      ],
    },
    {
      path: '/operation',
      name: 'Operation',
      component: Operation,
      redirect: '/operation/deploy',
      children: [{
          path: 'deploy',
          component: OperationDeploy,
        },
        {
          path: 'approval',
          component: OperationApproval,
        },
        {
          path: 'history',
          component: OperationHistory,
        },
        {
          path: 'undeploy',
          component: OperationUndeploy,
        },
        {
          path: 'templates',
          component: OperationTemplates,
        },
        {
          path: 'image',
          component: OperationImage,
        },
        {
          path: 'affinity',
          component: OperationAffinity,
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
          path: 'node',
          component: OperationNode,
        },
        {
          path: 'event',
          component: OperationEvent,
        },
        {
          path: 'tfc',
          component: OperationTfc
        }
      ],
    },
    {
      path: '/gateway',
      name: 'Gateway',
      component: OperationGateway,
    },
    marketSso,
    marketRepo,
    marketService,
    marketList,
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