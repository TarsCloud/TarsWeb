//用户体系配置 auth.js
module.exports = {
    enableAuth: false,
    authUrlPrefix: 'http://localhost:3001',            //登录检验服务前缀host
    addAuthUrl: '/api/auth/addAuth',                   //新增权限url
    deleteAuthUrl: '/api/auth/deleteAuth',                //删除权限url
    updateAuthUrl: '/api/auth/updateAuth',
    getAuthListByUidUrl: '/api/auth/getAuthListByUid',
    getAuthListByFlagUrl: '/api/auth/getAuthListByFlag',
    getAuthUrl: '/api/auth/getAuth'
};