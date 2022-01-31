// 市场
import MarketIndex from '@/market/index';
import Market from '@/market/market';

import List from '@/market/service/list';
import ServiceInfo from '@/market/service/index';

import Login from '@/market/user/login';
import Register from '@/market/user/register';
import Activate from '@/market/user/activate';
import Forget from '@/market/user/forget';
import ModifyPass from '@/market/user/modifyPass';
import ResetPass from '@/market/user/resetPass';

import RepoPass from '@/market/repository/repoPass';
import ListProject from '@/market/repository/index';

const marketSso = {
    path: '/market/user',
    name: 'MarketIndex',
    component: MarketIndex,
    children: [{
        path: 'login',
        component: Login,
    }, {
        path: 'register',
        component: Register,
    }, {
        path: 'activate',
        component: Activate,
    }, {
        path: 'forget',
        component: Forget,
    }, {
        path: 'modifyPass',
        component: ModifyPass,
    }, {
        path: 'resetPass',
        component: ResetPass,
    }]
};

const marketRepo = {
    path: '/market/repo',
    name: 'MarketRepo',
    component: MarketIndex,
    children: [{
        path: 'pass',
        component: RepoPass,
    }, {
        path: 'project',
        component: ListProject,
    }]
}

const marketService = {
    path: '/market/service',
    component: Market,
    children: [{
        path: ':group/:name/:version',
        component: ServiceInfo,
    }]
}

const marketList = {
    path: '/market/list',
    component: Market,
    children: [{
        path: '/',
        component: List
    }]
}

export {
    marketSso,
    marketRepo,
    marketService,
    marketList,
}