import Vue from 'vue';
import Router from 'vue-router';

// 服务管理
import Server from '@/pages/server/index';
import ServerManage from '@/pages/server/manage';
import ServerPublish from '@/pages/server/publish';
import ServerConfig from '@/pages/server/config';
import ServerServerMonitor from '@/pages/server/monitor-server';
import ServerPropertyMonitor from '@/pages/server/monitor-property';
import ServerBisMonitor from '@/pages/server/monitor-business';
import userManage from '@/pages/server/user-manage';
import InterfaceDebuger from '@/pages/server/interface-debuger';
import CallChain from '@/pages/server/call-chain';
import CallChainAnalyze from '@/pages/server/call-chain-analyze';
import Task from '@/pages/server/task';
import Token from '@/pages/server/token';

// 运维管理
import Operation from '@/pages/operation/index';
import OperationDeploy from '@/pages/operation/deploy';
import OperationExpand from '@/pages/operation/expand';
import OperationTemplates from '@/pages/operation/templates';

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
          path: ':treeid/business-monitor',
          component: ServerBisMonitor,
        },
        {
          path: ':treeid/interface-debuger',
          component: InterfaceDebuger,
        },
        {
          path: ':treeid/call-chain',
          component: CallChain,
        },
        {
          path: ':treeid/call-chain-analyze',
          component: CallChainAnalyze,
        },
        {
          path: ':treeid/task',
          component: Task,
        },
        {
          path: ':treeid/server-token',
          component: Token,
        },
        {
          path: ':treeid/user-manage',
          component: userManage,
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
      ],
    },
    {
      path: '*',
      redirect: '/server',
    },
    
    {
      path: '/pages/call-chain',
      name: 'CallChain',
      component: CallChain
    },
    {
      path: '/pages/deploy',
      name: 'Deploy',
      component: OperationDeploy
    },
    {
      path: '/pages/templates',
      name: 'Templates',
      component: OperationTemplates
    },
    {
      path: '/pages/call-chain-analyze/:treeid',
      name: 'CallChainAnalyze',
      component: CallChainAnalyze
    }
  ],
  scrollBehavior (to, from, savedPosition) {
    return {x: 0, y: 0}
  }
});
