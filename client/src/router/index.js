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
import Server from '@/pages/server/index';
import ServerManage from '@/pages/server/manage';
import ServerPublish from '@/pages/server/publish';
import ServerConfig from '@/pages/server/config';
import ServerServerMonitor from '@/pages/server/monitor-server';
import ServerPropertyMonitor from '@/pages/server/monitor-property';
import AuthManage from '@/pages/server/user-manage';
import InterfaceDebuger from '@/pages/server/interface-debuger';

// 运维管理
import Operation from '@/pages/operation/index';
import OperationDeploy from '@/pages/operation/deploy';
import OperationExpand from '@/pages/operation/expand';
import OperationTemplates from '@/pages/operation/templates';
import OperationNodes from '@/pages/operation/nodes';
import OperationCheck from '@/pages/operation/check';
import OperationGateway from '@/pages/operation/gateway/index';
import OperationApplication from '@/pages/operation/application';
import OperationBusiness from '@/pages/operation/business';
import OperationBusinessRelation from '@/pages/operation/businessRelation';
import OperationIDCManage from '@/pages/operation/idc';


Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/server',
      name: 'Server',
      component: Server,
      children: [
        {
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
      children: [
        {
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
          path: 'gateway',
          component: OperationGateway,
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
        }
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