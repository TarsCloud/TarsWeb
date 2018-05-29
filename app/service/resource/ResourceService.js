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
            msg: 'Tars node 已存在'
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
        shell = shell.replace('{{ip}}', thisIp).replace('{{port}}', port);
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
                msg: '未找到相应机器配置'
            }
        }
    } catch (e) {
        return {
            ip: ip,
            rst: false,
            msg: '安装Tars node失败'
        }
    }

};

ResourceService.getIPAdress = ()=> {
    var interfaces = os.networkInterfaces();
    for (var devName in interfaces) {
        var iface = interfaces[devName];
        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
};

module.exports = ResourceService;