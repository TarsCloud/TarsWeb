const path = require('path');

//用户体系配置 auth.js
module.exports = {
    enableAuth: true,
    authUrlPrefix: 'http://localhost:3001',            //登录检验服务前缀host
    addAuthUrl: '/api/auth/addAuth',                   //新增权限url
    deleteAuth: '/api/auth/deleteAuth',                //删除权限url
    modifyAuth: '/api/auth/modifyAuth',
    getAuthListByUid: '/api/auth/getAuthListByUid',
    getAuth: '/api/auth/getAuth',
    flagParamName: 'flag',
    roleParamName: 'role',
    uidParamName: 'uid'
};