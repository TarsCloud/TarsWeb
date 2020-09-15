[change history](changelist.Zh.MD)
## Efficient operation of the tars web management platform
[TARS](https://github.com/tarscloud/tars) is the open source version of the unified application framework TAF (total application framework) of the background logic layer that Tencent has been using since 2008,
Currently, C + +, Java, go, nodejs and PHP are supported. The framework provides users with a complete set of solutions related to development, operation and maintenance, as well as testing. Tars is naturally more powerful than RPC framework because Tars comes with its own operation and maintenance management platform.
Tars web is the operation and maintenance management platform of [TARS](https://github.com/tarscloud/tars) framework service, which provides rich functions to help a product or service develop, deploy, test and go online quickly.
Through the tars web management platform, users can easily complete the following contents:
*View the existing service IP list
*Change the service configuration of a single machine
*Service release, version rollback
*Call monitoring report to view
*Machine or service monitoring and reporting
*Single or batch service configuration
## Installation 
Because tars web relies on tars, please refer to [TARS installation instruction document](https://tarscloud.github.io/TarsDocs/installation/) to install tars web.

## Functions
Tars web provides visual operation to operate and maintain tars service. It can quickly build its own stable and reliable distributed application in the way of microservice, and realize complete and effective service governance. It has the following functions:
### Service deployment
Tars web provides the 'tars' service deployment function. Currently, the supported languages are
- [C++](https://github.com/TarsCloud/TarsCpp)
- [Java](https://github.com/TarsCloud/TarsJava) 
- [Go](https://github.com/TarsCloud/TarsGo)
- [Node.js](https://github.com/tars-node/Tars.js)
- [PHP](https://github.com/TarsPHP/TarsPHP)

On the platform, services can be simply deployed. Fill in the application name, service name, obj name and node address, select the service type and template to deploy a service.

### Release management
Release management will keep the uploaded release package and each release record. Version fallback and view are very convenient.
After the service is deployed, we publish a service through publishing management. Through the package compression tools provided by various languages, upload the publishing package on the publishing management page and click publish. You can select a previous release package release and view the history.

### Service expansion
Service expansion: the platform supports multi IP and one key expansion. When expanding, it supports copying the original node configuration. The expansion service is very convenient.

### Template management
In addition to the default template, tars also supports user-defined templates. You can create configuration templates that belong to your own business. It also supports inheritance of templates. After saving, the templates will be automatically merged and managed in a modular way.
### Service management
In the service management module, you can view the relevant information and real-time status of the service; you can specifically operate the service, including restart, stop, offline, etc.

### Service configuration
The management platform supports distribution configuration, usually using the corresponding business configuration in the distribution environment, such as mysql, redis address, port and other information. It's a good way to distinguish between development, testing, and formal environments.

### Service monitoring
Service monitoring is mainly used to count the data that services call each other and provide multi-dimensional visual monitoring,
It includes "main call", "called", "interface name", "main call IP", "called IP", "traffic", "time consuming", "exception rate", "timeout rate",
The first five items can be clicked to view all data. And you can compare the data of two days to see the fluctuation.

### Feature monitoring
The main function of the feature monitoring module is: Statistics Service custom feature. This module consists of attribute name, attribute value, and statistical method.
Click characteristic to view all characteristic names and characteristic values, and compare the data of two days.

### Interface debugging
It supports the debugging interface of 'tar' service by uploading 'tar' protocol file.

--------------------------------------------------------------------------------------------------------------------------------------------
## Open source module
Open source modules based on tars and tars web are as follows:
* [DCache](https://github.com/tencent/dcache): DCache is a distributed NoSQL storage system developed based on the tars framework. The data is stored in memory and supports the connection to the back-end dB for data persistence.
* [@tars/DCache](https://www.npmjs.com/package/@tars/dcache): the extension module of tar web, which is used to manage the management platform of DCache services.
License
The open source protocol of tars is bsd-3-clause. For details, see [license.txt](https://github.com/tarscloud/tars/blob/master/license.txt).
