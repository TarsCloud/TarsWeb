const CommonService = require('./k8s/service/common/CommonService');
const logger = require("./logger");
const _ = require('lodash');
const stream = require('stream');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

let ExecLog = async (request) => {

    // console.log('request', request);

    let connection = request.accept('log-protocol', request.origin);
    logger.info('Connection accepted');

    connection.on('close', function (reasonCode, description) {
        logger.info('peer ' + connection.remoteAddress + ' disconnected.');

    });

    let params = request.resourceURL.query;

    logger.info('request:', params);

    try {

        const logStream = new stream.PassThrough();

        logStream.on('data', (chunk) => {
            // console.log('data', chunk.toString());
            connection.send(chunk.toString());
        })

        logStream.on('close', () => {
            console.log('close');
            connection.close();
        })

        let data = await CommonService.describePod(params.podName);

        logger.info('container:', data.body.spec.containers[0].name, 'podName:', params.podName);

        await CommonService.readPodLog(data.body.spec.containers[0].name, params.podName, params.previous, logStream);

    } catch (e) {

        logger.error(e, e.statusCode);

        connection.close();
    }
}

module.exports = ExecLog;