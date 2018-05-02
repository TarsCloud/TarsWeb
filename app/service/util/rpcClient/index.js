var client  = require("@tars/rpc/protal.js").client;
var TarsProxy = require("./rpcProxy/NodeTarsProxy");
var AdminRegProxy = require("./rpcProxy/AdminRegProxy");
var ConfigFProxy = require("./rpcProxy/ConfigFProxy");

//生成RPC代理方法
var RPCClientPrx = (tafClient, proxy, moduleName, interfaceName, servantName, setInfo) => {
    if(tafClient && tafClient.constructor!=client.constructor){
        setInfo = servantName;
        servantName = interfaceName;
        interfaceName = moduleName;
        moduleName = proxy;
        proxy = tafClient;
    }else{
        client = tafClient||client;
    }
    var module = proxy[moduleName];
    var rpcClient = client.stringToProxy(module[interfaceName+'Proxy'], servantName, setInfo);

    for(var p in rpcClient){
        if(!rpcClient.hasOwnProperty(p) && p!='getTimeout' && p!='setTimeout'){
            ((p, fun) => {
                rpcClient[p] = async function(...args){
                    try{
                        var _args = args;
                        var rst = await (async ()=>{
                            var result = await fun.apply(rpcClient, _args);
                            var args = result.response.arguments;
                            var rst = {__return: result.response.return};
                            for(var p in args){
                                if(typeof args[p] == 'object'){
                                    rst[p] = args[p].toObject();
                                }else{
                                    rst[p] = args[p];
                                }
                            }
                            return rst;
                        })();
                        return rst;
                    }catch(e){
                        console.log(e);
                        if(e.response){
                            throw new Error(e.response && e.response.error && e.response.error.message);
                        }else{
                            throw(e);
                        }
                    }
                };
            })(p, rpcClient[p]);

        }
    }
    return rpcClient;
};

//生成rpc结构体
var RPCStruct = function(proxy, moduleName){
    var module = proxy[moduleName];
    var rpcStruct = {};
    for(var p in module){
        if(module.hasOwnProperty(p)){
            if(typeof module[p] == 'function'){
                if(new module[p]()._classname){
                    rpcStruct[p] = module[p];
                }
            }else{
                rpcStruct[p] = module[p];
            }
        }
    }
    return rpcStruct;
};

//输出TARS RPC代理和组件
module.exports = {
    // tarsPrx : RPCClientPrx(TarsProxy, 'tars', 'NodeTars', 'TARS.NodeTarsServer.NodeTarsObj@tcp -h 127.0.0.1 -p 14002 -t 10000'),
    // tarsStruct : RPCStruct(TarsProxy, 'tars'),

    // adminRegPrx : RPCClientPrx(AdminRegProxy, 'tars', 'AdminReg', 'tars.tarsAdminRegistry.AdminRegObj@tcp -h 127.0.0.1 -p 14002 -t 10000'),
    // adminRegStruct : RPCStruct(AdminRegProxy, 'tars'),

    adminRegPrx : RPCClientPrx(AdminRegProxy, 'tars', 'AdminReg', 'TARS.NodeTarsServer.AdminReg@tcp -h 127.0.0.1 -p 14004 -t 10000'),
    adminRegStruct : RPCStruct(AdminRegProxy, 'tars'),

    // configFPrx : RPCClientPrx(ConfigFProxy, 'tars', 'Config', 'tars.tarsconfig.ConfigObj@tcp -h 127.0.0.1 -p 14002 -t 10000'),
    // configFStruct : RPCStruct(ConfigFProxy, 'tars'),

    configFPrx : RPCClientPrx(ConfigFProxy, 'tars', 'Config', 'TARS.NodeTarsServer.Config@tcp -h 127.0.0.1 -p 14003 -t 10000'),
    configFStruct : RPCStruct(ConfigFProxy, 'tars'),
};