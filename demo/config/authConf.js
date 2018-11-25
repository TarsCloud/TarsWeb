module.exports = {
    /**
     * 可以操作权限列表的用户ID, 此处表示只有admin用户才能操作权限模块增删页面
     */
    admin: ['admin'],

    /**
     * 白名单IP，只有其中的ip发起的请求可以调用用户权限增删改借口
     */
    whiteIps: ['127.0.0.1']
};