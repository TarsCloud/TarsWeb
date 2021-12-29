const CommonService = require('./k8s/service/common/CommonService');
const logger = require("./logger");
const ExecOperator = {};
const _ = require('lodash');

function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
}

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

let exec = async () => {

    global.wsServer.on('request', async function (request) {

        let connection = request.accept('echo-protocol', request.origin);
        // console.log(connection);
        logger.info((new Date()) + ' Connection accepted');

        connection.on('close', function (reasonCode, description) {
            logger.info((new Date()) + ' peer ' + connection.remoteAddress + ' disconnected.');
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

            let ws = await CommonService.connectPodExec(params.PodName, command, pod.spec.containers[0].name);

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

    });
}

ExecOperator.start = () => {
    exec();
}

module.exports = ExecOperator;