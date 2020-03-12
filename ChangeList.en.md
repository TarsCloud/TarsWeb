
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
