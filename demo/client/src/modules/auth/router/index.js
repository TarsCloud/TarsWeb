import Vue from 'vue';
import Router from 'vue-router';

// 登录注册管理
import AuthManage from '@/modules/auth/pages/authManage';
import UserManage from '@/modules/auth/pages/userManage';
import InfoManage from '@/modules/auth/pages/infoManage';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/auth',
      name: 'AuthManage',
      component: AuthManage
    },
    {
      path: '/user',
      name: 'userManage',
      component: UserManage
    },
    {
      path: '/',
      name: 'infoManage',
      component: InfoManage
    },
  ],
});
