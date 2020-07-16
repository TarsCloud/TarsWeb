import Vue from 'vue';
import Router from 'vue-router';

// 登录注册管理
import AuthManage from '@/sso/auth/pages/authManage';
import UserManage from '@/sso/auth/pages/userManage';
import InfoManage from '@/sso/auth/pages/infoManage';
import TokenManage from '@/sso/auth/pages/tokenManage';

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
      path: '/token',
      name: 'tokenManage',
      component: TokenManage
    },
    {
      path: '/',
      name: 'infoManage',
      component: InfoManage
    },
  ],
});
