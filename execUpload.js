const PatchService = require('./app/service/patch/PatchService');
const logger = require("./logger");
const _ = require('lodash');
const util = require('./tools/util');
const WebConf = require('./config/webConf');
const fs = require('fs-extra');
const path = require('path');

function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
}

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

let ExecUpload = async (request) => {

    console.log('ExecUpload');

    let connection = null;
    try {

        let uploadFile = -1;

        connection = request.accept('upload-protocol', request.origin);
        logger.info('Connection accepted');

        connection.on('close', function (reasonCode, description) {
            logger.info(`peer ${connection.remoteAddress} disconnected, ${reasonCode}, ${description}`);

        });

        let params = request.resourceURL.query;
        let baseUploadPath = WebConf.pkgUploadPath.path;
        let filename = util.getUUID().toString();

        logger.info('upload file: ', baseUploadPath);
        fs.mkdirSync(baseUploadPath, {
            recursive: true
        });

        let updateTgzFile = `${baseUploadPath}/${filename}`;

        let total = 0;
        connection.on('message', async function (message) {

            // logger.info("web->nodejs:", message.type);

            if (message.type == "utf8") {

                logger.info("start web->nodejs type:", message.type, message.utf8Data);

                if (message.utf8Data == "start") {

                    console.log("start openSync:", updateTgzFile);
                    uploadFile = fs.openSync(updateTgzFile, 'w');


                } else if (message.utf8Data == "end") {

                    logger.info(`end web->nodejs, type: ${message.type}, total: ${total}`);
                    if (uploadFile >= 0) {
                        fs.closeSync(uploadFile);
                        uploadFile = -1;
                    }

                    logger.info(`upload file size:`, fs.statSync(updateTgzFile).size);

                    if (fs.statSync(updateTgzFile).size != total) {
                        throw Error('upload file size not correct.');
                    }
                    let task_no = util.getUUID().toString();

                    let rst = await PatchService.uploadAndPatch(params.app, params.server, '', task_no, "install from cloud", 0, filename, 'cloud', params.uid || '');

                    connection.send(JSON.stringify(rst));

                }
            } else {
                fs.writeSync(uploadFile, message.binaryData, 0, message.binaryData.length, total);

                total += message.binaryData.length;

            }
        });
    } catch (e) {

        logger.error(e);

        if (connection) {
            connection.close();
            connection = null;
        }
    }
}

module.exports = ExecUpload;