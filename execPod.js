const CommonService = require('./k8s/service/common/CommonService');
const logger = require("./logger");
const _ = require('lodash');

// function originIsAllowed(origin) {
//     // put logic here to detect whether the specified origin is allowed.
//     return true;
// }

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

let ExecPod = async (request) => {

    let ws = null;

    let connection = request.accept('echo-protocol', request.origin);
    // console.log(connection);
    logger.info('Connection accepted');

    connection.on('close', function (reasonCode, description) {
        logger.info('peer ' + connection.remoteAddress + ' disconnected.');

        if (ws) {
            //close pod shell
            var buffer = Buffer.from("exit\r\n", 'utf8');
            var panddingBuffer = Buffer.concat([Buffer.from('00', 'hex'), buffer]);
            ws.send(panddingBuffer);
        }
    });

    let params = request.resourceURL.query;

    // logger.info('request:', params);

    let command = ['bash', '-c'];

    let sh;

    if (params.History == 'true') {
        sh = `#!/bin/sh
                dir=/usr/local/app/${CommonService.TServerType1}/app_log/${params.PodName}/${params.ServerApp}/${params.ServerName}
                if [ -d $dir ]; then 
                    cd $dir 
                fi 
                if [ ! -f /bin/bash ]; then 
                    sh 
                else 
                    bash 
                fi`;

        let pod = await CommonService.getDaemonPodByHostIp(params.NodeIP);

        // console.log(pod);
        params.PodName = pod.metadata.name;

    } else {
        sh = `#!/bin/sh 
            dir=/usr/local/app/${CommonService.TServerType1}/app_log/${params.ServerApp}/${params.ServerName} 
            if [ -d $dir ]; then 
                cd $dir 
            fi 
            if [ ! -f /bin/bash ]; then 
                sh 
            else   
                bash 
            fi`
    }

    command.push(sh);

    try {

        let pod = (await CommonService.getPod(params.PodName)).body;

        logger.info('PodName:', params.PodName, pod.spec.containers[0].name);

        ws = await CommonService.connectPodExec(params.PodName, command, pod.spec.containers[0].name);

        ws.on('close', (code, reason) => {
            logger.error('close:', code, reason);
        });

        ws.on('error', (error) => {
            logger.error("error:", error);
        });

        ws.on('ping', (data) => {
            logger.info("ping:", data);
        });

        ws.on('open', () => {
            logger.info('connected to container');
        });

        ws.on('message', (data) => {

            // logger.info("api->nodejs:'" + data.toString() + "'");

            let msg = {
                operation: "stdout",
                data: data.toString()
            }
            connection.send(JSON.stringify(msg));
        });

        connection.on('message', function (message) {

            if (ws && ws.readyState === 1) {

                // logger.info("web->nodejs:", JSON.stringify(message));

                let msg = JSON.parse(message.utf8Data);
                switch (msg.operation) {
                    case "stdin":
                        var buffer = Buffer.from(msg.data, 'utf8');
                        var panddingBuffer = Buffer.concat([Buffer.from('00', 'hex'), buffer]);
                        // console.log(msg.data);
                        ws.send(panddingBuffer);
                        break;
                    case "resize":
                        process.stdout.rows = msg.height;
                        process.stdout.columns = msg.width;
                        process.stdout.emit("resize");
                        break;
                    case "ping":
                        let rsp = {
                            operation: "pong",
                            data: ""
                        };
                        connection.send(JSON.stringify(rsp));
                        break;
                    default:
                }
            }
        });
    } catch (e) {

        logger.error(e);

        connection.close();
    }
}

module.exports = ExecPod;