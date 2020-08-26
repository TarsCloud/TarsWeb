## 20200819(2.4.9)
- tarsnode tag
- patch package download
- tarsnode batch update
- config UI modify
- web UI support multi tab
- dcache support install dbaccess/backup/mirror
- add login verify code
- add search
- fix auth bug
- fix sync db bug
- fix monitor chart data bug


## 20200805(2.4.8)
- update dcache logo
- fix create table charset bug
- support ldap login
- support all user is admin
- add update.js for db upgrate
- /api/upload_patch_package return json
- update webConf, charset use utf8
- fix dcache property bug
- fix config overflow bug
- fix dcache proxy/router default template
- fix db sync bug
- fix benchmark, bug
- fix tars protocol parse bug
- support multi tab

## 20200718(2.4.7)
- add multi-gateway configuration feature
- add path input when adding router in gateway station
- support dcache deploy, support router, cache, proxy, dbaccess auto deploy
- merge demo to web, not open to ports
- support tars tree set bussiness relation
- support tarsgo gracefull patch

## 20200703(2.4.6)
- fix strict mode, tarslog transfer deploy bug
- edit servant obj, obj name can not has digit bug
- Add TARS_WEB_SSO_PREFIX environment variable to identify the common prefix of web and demo, which is easy to deploy, for example: Web - > tars.com , demo-> sso.tars.com , export TARS_ WEB_ SSO_ PREFIX=sso

## 20200620(2.4.5)
- add gateway config
- add operator permissions to current user when current user don't has admin auth

## 20200612(2.4.4)
- add install tutorial when benchmark admin is not installed
- optimize the error message in benchmark tool when framework server exception
- fix bug of not redirecting to login page when the uid and ticket in cookies are timeout

## 20200612(2.4.3)
- add benchmark tool to infTest

## 20200506(2.4.2)
- remove the space characters at the beginning and end of the file name when adding config file
- fix bug of duplicate judgment when deploying a service
- fixed bug of the application list and node list were emptied after the service was successfully deployed
- fix bug of line wrap in modal of publish server

## 20200505(2.4.1)
- add dcache module to tars web

## 20200505(2.4.0)
- fix interface test bug when the server returns result of exception
- fix protocal parse error when it has some special default value in interface test
- fix bug of time order in monitor result
- fix bug of tarsnode_install.sh
- fix bug of timeout in pingNode 
- add houer filter of monitor query
- add output info of tarsnode auto install 
- unified version with TarsFramework to improve git workflow

## 20200331(2.1.0)
- Modify the problem of token generation and increase the random number
- Add the function of deleting nodes
- Automatically publish, add blocking logic, and do not return until there are publishing results
- Publish add result display
- fix db_cache_web.sql, Fix SQL statement order to avoid foreign key error prompt
- logview Support the display of special characters
- add status display in node check

## 20200312(2.0.0)
- querystat & queryproperty change protocol to tars
- tarsadmin multi machine alive
- web show tarsadmin&registry
- web: node add node connection check
- clear publish history
- auto upload & publish
- add framework check
- not stop tarsadminRegistry?
- deploy: input application can select
- show version in index page
- open dcache default
- add token support
- node list choose in deploy

## 20200105(1.5.1)
- When modifying nodes without IP and using domain names, the tar node docker pulls the bug of tarsnode.tgz
- Fix bug referencing configuration file
- Fix the permission bug caused by sequenize upgrade to version 5.0
- Webconf adds a configuration so that the upload package does not verify the login (the installation package can be uploaded automatically if required under the development of test environment)

## 20200103(1.5.0)
- Add the function of viewing log: under the service list of service management, click the service name to enter the interface of viewing the service log
- Fix bugs not shown in release history
- Fix the bug that the "push configuration file" does not take effect in the service configuration

## 20191226(1.4.2)
- Tarsnode.tgz get the added route path: http://xxx/files/tarsnode.tgz

## 20191225(1.4.1)
- Fix bugs in online installation of tarsnode in docker environment
- Webconf adds host and replaces cost machine IP during installation
- Add / get tarsnode URL to get the script to install tarsnode

## 20191223(1.4.0)
- During the installation, the installation package of the framework service is stored in the web / files directory, which is convenient for the update and installation of the framework service
- Fix bug in auto install node
- When installing a node, add a value to determine whether tarsnode.tgz exists
- Add strict mode (valid when webconf. Strict = true or environment variable tars ﹣ web ﹣ strict = true)
-The following features are available in strict mode:
>- Framework node, do not allow publishing other business services
>- There must be a node for the basic services of tars. You are not allowed to log off
>- Tarslog adds migration and deployment function. Before deploying other services, tarslog must be migrated and deployed on non framework nodes

## 20191216(1.3.1)
- Web: add tarsnode installation logic to operation and maintenance management interface

## 20191214(1.3.0)
- Web: add tarsnode list to operation and maintenance management interface
- Fix 1.2.0 bug

## 20191213(1.2.0)
- Need to upgrade CPP to 1.2.0, protocol to 1.2.0, framework to 1.2.0
- Web: deploy SSL service, support service binding domain name
- Web: check the active status of the service when offline
- When the Web: service is expanded, the domain name can be bound
- Web: adjust the publishing interface to make the operation easier to understand
- Web: add and refresh the service management interface
- Web: prompt for publishing errors (jump to the service management page to view)

## 20191128(1.1.1)
- Update tar web support and mount nginx on the front end of tar Web

## 20191126(1.0.0)
- Update the installation mode of tar web, and support permission verification by default
- Create the admin user by default, and change the admin password for the first login
- Registration not allowed, admin user to create user
- Add password modification function
