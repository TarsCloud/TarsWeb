const nodeSsh = require('node-ssh')
const NodeInfoDao = require('../../dao/NodeInfoDao');
const ServerDao = require('../../dao/ServerDao');
const _ = require('lodash');
const fs = require('fs-extra');
const ResourceService = {};
const os = require('os');
const internalIp = require('internal-ip')
const webConf = require('../../../config/webConf').webConf;
const path = require('path');
const resourceConf = require('../../../config/resourceConf');
const Util = require('../../tools/util');
const logger = require('../../logger');

/**
 * 批量检测并安装Tars node
 * @param ips
 * @returns {Array}
 */
ResourceService.installTarsNodes = async(ips) => {
    //若该ip已经存在表中，则不安装tars node。
    let rst = [];
    let nodeInfos = await NodeInfoDao.getNodeInfo(ips);
    let installedIps = [];
    nodeInfos.forEach((nodeInfo)=> {
        nodeInfo = nodeInfo.dataValues;
        installedIps.push(nodeInfo.endpoint_ip);
        rst.push({
            ip: nodeInfo.endpoint_ip,
            rst: true,
            msg: '#api.resource.tarsNodeExist#'
        });
    });
    let needInstallIps = _.difference(ips, installedIps);
    let installTask = [];
    needInstallIps.forEach((ip)=> {
        installTask.push(ResourceService.doInstallTarsNode(ip));
    });
    let installRst = await Promise.all(installTask);
    rst = rst.concat(installRst);
    return rst;
};

/**
 * 安装单个Tars node
 * @param ip
 * @returns {*}
 */
ResourceService.doInstallTarsNode = async(ip) => {
    try {
        let shell = await fs.readFile(__dirname + '/tarsnode_install.sh', 'utf8');
        let thisIp = internalIp.v4.sync();
        let port = process.env.PORT || webConf.port || '3000';
        shell = shell.replace('${ip}', thisIp).replace('${port}', port).replace('${machine_ip}', ip);
        let rst = await ResourceService.doSSHTask(ip, shell);
        if (rst.rst) {
            if (rst.msg.indexOf('Tars node has installed') > -1) {
                rst.rst = false;
                rst.msg = '#api.resource.tarsNodeExist#';
            } else if (rst.msg.indexOf('Tars node installed success') > -1) {
                rst.msg = '#api.resource.installSuccess#';
            } else {
                rst.rst = false;
                rst.msg = '#api.resource.installFailed#';
            }
        }
        return rst;
    } catch (e) {
        return {
            ip: ip,
            rst: false,
            msg: '#api.resource.installFailed#'
        }
    }
};

/**
 * 批量卸载Tars node
 * @param ips
 * @returns {Array.<*>}
 */
ResourceService.uninstallTarsNode = async(ips) => {
    //若该ip对应的机器中还有服务，则不允许下线
    let rst = [];
    let promiseList = [];
    let serverConfs = await ServerDao.getServerConfByNodeName(ips);
    for (let i = 0; i < ips.length; i++) {
        let ip = ips[i];
        let idx = _.findIndex(serverConfs, (serverConf)=> {
            serverConf = serverConf.dataValues;
            return serverConf.node_name == ip;
        });
        if (idx != -1) {
            rst.push({
                ip: ip,
                rst: false,
                msg: '#api.resource.serverExist#'
            });
        } else {
            promiseList.push(ResourceService.doUninstallTarsNode(ip));
        }
    }
    let uninstallRst = await Promise.all(promiseList);
    let deleteIps = [];
    uninstallRst.forEach((uninstallRstItem)=> {
        if (uninstallRstItem.rst === true) {
            deleteIps.push(uninstallRstItem.ip);
        }
    });
    await NodeInfoDao.deleteNodeInfo(deleteIps);
    return rst.concat(uninstallRst);
};

/**
 * 卸载单个机器上的Tarsnode
 * @param ip
 * @returns {*}
 */
ResourceService.doUninstallTarsNode = async(ip) => {
    try {
        let shell = await fs.readFile(__dirname + '/tarsnode_uninstall.sh', 'utf8');
        let rst = await ResourceService.doSSHTask(ip, shell);
        if (rst.rst) {
            if (String(rst.msg).indexOf('Tars node uninstall success') > -1) {
                rst.msg = '#api.resource.uninstallSuccess#'
            } else {
                rst.rst = false;
                rst.msg = '#api.resource.uninstallFailed#'
            }
        }
        return rst;
    } catch (e) {
        return {
            ip: ip,
            rst: false,
            msg: '#api.resource.uninstallFailed#'
        }
    }
};

/**
 * 获取ssh配置并执行ssh任务
 * @param ip
 * @param shell
 * @returns {*}
 */
ResourceService.doSSHTask = async(ip, shell)=> {
    try {
        let sshConf = await ResourceService.getSSHConfig(ip);
        if (!sshConf) {
            return {
                ip: ip,
                rst: false,
                msg: '#api.resource.notConfig#'
            }
        } else {
            return await ResourceService.execSSH(ip, shell, sshConf);
        }
    } catch (e) {
        return {
            ip: ip,
            rst: false,
            msg: '#api.resource.sshFailed#'
        }
    }
};

/**
 * 获取ssh配置
 * @param ip
 * @returns {*}
 */
ResourceService.getSSHConfig = async(ip) => {
    try {
        let sshConf = false;
        if (resourceConf.getMachineConf) {
            let conf = false;
            try{
                conf = await Util.jsonRequest.get(resourceConf.getMachineConf, {ip: ip});
            }catch(e){
                logger.error('getSSHConfig', e);
                conf = false;
            }
            if(_.isPlainObject(conf) && conf.port != undefined && conf.username != undefined && conf.password != undefined){
                conf.ip = ip;
                sshConf = conf;
            }else{
                sshConf = false;
            }
        }
        if(!sshConf){
            let sshConfs = await fs.readJson(path.join(__dirname, '../../../config/sshConf.json'));
            let index = _.findIndex(sshConfs || [], (o) => {
                return o.ip === ip
            });
            if (index > -1) {
                sshConf = sshConfs[index];
            } else {
                sshConf = false;
            }
        }
        return sshConf;
    } catch (e) {
        return false;
    }
};

/**
 * 远程登录机器并执行ssh
 * @param ip
 * @param shell
 * @param sshConf
 * @returns {*}
 */
ResourceService.execSSH = async(ip, shell, sshConf)=> {
    try {
        let ssh = new nodeSsh();
        await ssh.connect({
            host: sshConf.ip,
            port: sshConf.port,
            username: sshConf.username,
            password: sshConf.password
        });
        let result = await ssh.execCommand(shell);
        return {
            ip: ip,
            rst: result.code == 0,
            msg: result.code == 0 ? result.stdout : result.stderr
        };
    } catch (e) {
        return {
            ip: ip,
            rst: false,
            msg: '#api.resource.sshFailed#'
        }
    }
};

module.exports = ResourceService;