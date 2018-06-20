const nodeSsh = require('node-ssh')
const NodeInfoDao = require('../../dao/NodeInfoDao');
const ServerDao = require('../../dao/ServerDao');
const _ = require('lodash');
const sshConfs = require('../../../config/sshConf').sshConfs;
const fs = require('fs-extra');
const ResourceService = {};
const os = require('os');
const internalIp = require('internal-ip')
const webConf = require('../../../config/webConf').webConf;

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


ResourceService.doInstallTarsNode = async(ip) => {
    try {
        let shell = await fs.readFile(__dirname + '/tarsnode_install.sh', 'utf8');
        let thisIp = internalIp.v4.sync();
        let port = process.env.PORT || webConf.port || '3000';
        shell = shell.replace('${ip}', thisIp).replace('${port}', port).replace('${machine_ip}', ip);
        let rst = await ResourceService.doSSHTask(ip, shell);
        if(rst.rst){
            if(rst.msg.indexOf('Tars node has installed') > -1){
                rst.rst = false;
                rst.msg = '#api.resource.tarsNodeExist#';
            }else if(rst.msg.indexOf('Tars node installed success') > -1){
                rst.msg = '#api.resource.installSuccess#';
            }else{
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
        if(uninstallRstItem.rst === true){
            deleteIps.push(uninstallRstItem.ip);
        }
    });
    await NodeInfoDao.deleteNodeInfo(deleteIps);
    return rst.concat(uninstallRst);
};


ResourceService.doUninstallTarsNode = async(ip) => {
    try {
        let shell = await fs.readFile(__dirname + '/tarsnode_uninstall.sh', 'utf8');
        let rst = await ResourceService.doSSHTask(ip, shell);
        if(rst.rst){
            if(String(rst.msg).indexOf('Tars node uninstall success') > -1){
                rst.msg = '#api.resource.uninstallSuccess#'
            }else{
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

ResourceService.testSSH = async(ip) =>{
    let shell = 'dir /b';
    let rst = await ResourceService.doSSHTask(ip, shell);
    return {
        rst: rst
    }
};


ResourceService.doSSHTask = async(ip, shell)=> {
    console.log(ip)
    console.log(shell);
    try {
        let index = _.findIndex(sshConfs || [], (o) => {
            return o.ip === ip
        });
        if (index > -1) {
            let sshConf = sshConfs[index];
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
                msg: result.code == 0 ? result.stdout: result.stderr
            };
        } else {
            return {
                ip: ip,
                rst: false,
                msg: '#api.resource.notConfig#'
            }
        }
    } catch (e) {
        return {
            ip: ip,
            rst: false,
            msg: '#api.resource.sshFailed#'
        }
    }
};

module.exports = ResourceService;