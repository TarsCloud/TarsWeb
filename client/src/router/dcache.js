import Vue from 'vue';
import Router from 'vue-router';

// 服务管理
import Server from '@/pages/server/index';
import ServerManage from '@/pages/server/manage';
import ServerPublish from '@/pages/server/publish';
import ServerConfig from '@/pages/server/config';
import ServerServerMonitor from '@/pages/server/monitor-server';
import ServerPropertyMonitor from '@/pages/server/monitor-property';
import userManage from '@/pages/server/user-manage';
import InterfaceDebuger from '@/pages/server/interface-debuger';

// 运维管理
import Operation from '@/pages/operation/index';
import OperationDeploy from '@/pages/operation/deploy';
import OperationExpand from '@/pages/operation/expand';
import OperationTemplates from '@/pages/operation/templates';

// 发布包管理
import releasePackage from '@/pages/releasePackage/index';
import proxyList from '@/pages/releasePackage/proxyList';
import routerList from '@/pages/releasePackage/routerList';
import cacheList from '@/pages/releasePackage/cacheList';


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
      path: '*',
      redirect: '/server',
    },
  ],
  scrollBehavior (to, from, savedPosition) {
    return {x: 0, y: 0}
  }
});
