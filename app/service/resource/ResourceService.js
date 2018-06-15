const nodeSsh = require('node-ssh')
const ResourceDao = require('../../dao/ResourceDao');
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
    let nodeInfos = await ResourceDao.getNodeInfo(ips);
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
    needInstallIps.forEach((ip)=>{
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
        return await ResourceService.doSSHTask(ip, shell);
    } catch (e) {
        return {
            ip: ip,
            rst: false,
            msg: '#api.resource.installFailed#'
        }
    }
};

ResourceService.doUninstallTarsNode = async(ip) => {
    try {
        let shell = await fs.readFile(__dirname + '/tarsnode_uninstall.sh', 'utf8');
        return await ResourceService.doSSHTask(ip, shell);
    } catch (e) {
        return {
            ip: ip,
            rst: false,
            msg: '#api.resource.uninstallFailed#'
        }
    }
};


ResourceService.doSSHTask = async(ip, shell)=>{
    console.log(ip)
    console.log(shell);
    try{
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
            await ssh.exec(shell).then((result)=> {
                return {
                    ip: ip,
                    rst: true,
                    msg: result
                }
            })
        } else {
            return {
                ip: ip,
                rst: false,
                msg: '#api.resource.notConfig#'
            }
        }
    }catch(e){
        return {
            ip: ip,
            rst: false,
            msg: '#api.resource.notConfig#'
        }
    }
};

module.exports = ResourceService;