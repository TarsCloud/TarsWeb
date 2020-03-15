[变更历史](ChangeList.zh.md)

## 高效运营的 Tars web 管理平台

[Tars](https://github.com/TarsCloud/Tars) 是腾讯从 2008 年到今天一直在使用的后台逻辑层的统一应用框架 TAF（Total Application Framework）的开源版本，
目前支持 C++、Java、go、Nodejs、PHP 语言。该框架为用户提供了涉及到开发、运维、以及测试的一整套解决方案。而 Tars 天然比单纯的 RPC 框架更强大一些，是因为
Tars 是自带运维管理平台的。

Tars web 是 [TARS](https://github.com/TarsCloud/Tars) 框架服务的运维管理平台，提供了丰富的功能来帮助一个产品或者服务快速开发、部署、测试、上线。
通过 Tars web 管理平台, 使用者可以轻松完成如下内容:

- 查看现有服务 ip 列表
- 对单台机器进行服务配置变更
- 服务发布、版本回退
- 调用监控上报查看
- 机器或服务本身监控上报查看
- 单个或批量进行服务配置

## 安装

因为 Tars web 依赖 Tars，请参考 [Tars 安装说明文档](https://tarscloud.github.io/TarsDocs/installation/) 安装 Tars web。

## 功能

Tars web 提供可视化的操作来运维 Tars 服务，可以快速用微服务的方式构建自己的稳定可靠的分布式应用，并实现完整有效的服务治理。具有以下功能：

### 服务部署

Tars web 提供了 `Tars` 服务部署功能，现支持的语言有

- [C++](https://github.com/TarsCloud/TarsCpp)
- [Java](https://github.com/TarsCloud/TarsJava)
- [go](https://github.com/TarsCloud/TarsGo)
- [nodejs](https://github.com/tars-node/Tars.js)
- [php](https://github.com/TarsPHP/TarsPHP)
  在平台上，可以很简单的部署服务。填好应用名、服务名、obj 名、节点地址，选好服务类型、模版即可部署一个服务。

### 发布管理

发布管理会保留上传的发布包，和每一次的发布记录。版本回退、查看操作非常方便。
部署好服务后， 我们通过发布管理来发布一个服务，通过各个语言提供的打包压缩工具，在发布管理页面上传发布包，点击发布即可。可以选择以前的发布包发布，和查看历史记录。

### 服务扩容

服务扩容，平台支持多 ip 一键扩容， 扩容的时候，支持复制原节点配置，扩容服务非常便捷。

### 模版管理

Tars 除了默认的模版， 也支持自定义模版，可以创建属于自己业务的配置模版；也支持继承模版，保存后会自动合并，模块式管理模版。

### 服务管理

在服务管理模块，可以查看服务的相关信息、实时状态；可以针对性的对服务进行操作，包含重启、停止、下线等。

### 服务配置

管理平台支持下发配置，通常使用在下发环境对应的业务配置，例如 mysql，redis 地址，端口等信息。可以很好的区分开发、测试还是正式环境。

### 服务监控

服务监控，主要统计服务之间相互调用的数据，提供多维度可视化监控，
包括 `主调`、`被调`、`接口名`、`主调ip`、`被调ip`、`流量`、`耗时`、`异常率`、`超时率`，
其中前五项均可点击查看所有数据。并且可以对比两天的数据，查看波动。

### 特性监控

特性监控模块主要功能为：统计服务自定义特性。此模块由特性名、特性值、以及统计方法构成。
点击【特性】查看所有的特性名与特征值，同时可以对比两天的数据。

### 接口调试

支持 `tars` 服务上传 `tars` 协议文件调试接口。

---

## 开源模块

基于 Tars 和 Tars web 开源的模块，现已开源模块有：

- [DCache](https://github.com/Tencent/DCache)：DCache 是一个基于 TARS 框架开发的分布式 NoSQL 存储系统，数据采用内存存储，支持连接后端 DB 实现数据持久化。
- [@tars/dcache](https://www.npmjs.com/package/@tars/dcache)：Tars web 的扩展模块，用于管理 DCache 服务的管理平台。

## License

Tars 的开源协议为 BSD-3-Clause，详情参见[LICENSE.TXT](https://github.com/TarsCloud/Tars/blob/master/LICENSE.TXT)。
