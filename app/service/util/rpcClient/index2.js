
var TarsClient  = require("@tars/rpc/protal.js").client;
var TarsProxy = require("./NodeTarsProxy").tars;

//使用配置文件初始化通信器
TarsClient.initialize(__dirname + "/config.conf");

var rpcProxyObj = {};
var rpcProxyFactory = (prxName, servent, proxy) => {
    rpcProxyObj[prxName] = TarsClient.stringToProxy(proxy, servent);
};

//生成代理类
//var prx = TarsClient.stringToProxy(TarsProxy.NodeTarsProxy, TarsClient.configure.get("main.DevServer"));        //客户端和服务端都部署在IDC机房。客户端通过主控，查询活动列表，然后调用服务端
//var prx = TarsClient.stringToProxy(TarsProxy.NodeTarsProxy, TarsClient.configure.get("main.ProxyServer"));      //客户端部署在本地，服务端部署在IDC机房。客户端通过“特别代理”，连接IDC机器
var servant=TarsClient.configure.get("main.LocalServer");
// var tarsPrx = TarsClient.stringToProxy(TarsProxy.NodeTarsProxy,servant);      //客户端和服务端都部署在本地。客户端直连本地服务
rpcProxyFactory('tarsPrx', servant, TarsProxy.NodeTarsProxy);

var prx = rpcProxyObj['tarsPrx'];
for(var i in prx){
    console.log(i);
}


//调用代理类方法
var rpcProxyApply = async(prxName, func, args) =>{
    var prx = rpcProxyObj[prxName];
    var result = await prx[func].apply(prx, args);

    return {
        result: result.response.arguments,
        __return: result.response.return
    }

}

module.exports = rpcProxyApply
