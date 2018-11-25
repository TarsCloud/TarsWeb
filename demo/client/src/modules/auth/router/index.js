import Vue from 'vue';
import Router from 'vue-router';

// 登录注册管理
import AuthManage from '@/modules/auth/pages/authManage';


Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'AuthManage',
      component: AuthManage
    }
  ],
});
