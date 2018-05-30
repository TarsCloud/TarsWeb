/**
 * Created by clauseliu on 2018/5/29.
 */

const WebSocket = require('ws');

let TCPClient = function (ip, port, requestObj) {
    let wsClient = new WebSocket(`ws://${ip}:${port}`);
    wsClient.on('open', function () {
        wsClient.send(JSON.stringify(requestObj));
    });

    return new Promise((resolve, reject) =>{
        wsClient.on('message', function(e) {
            wsClient.close();
            try {
                let response = e.split(/\n/);
                response = response.map((n) => {
                    return n.replace(/^\s*|\s*$/g,'').replace(/,$/,'');
                });
                if(!/Ret/.test(response[0])){
                    return reject(`line #1, doesn't start with "Ret:", line = ${response[0]}`);
                }
                let ret = parseInt(response[0].split(':')[1]);
                if(ret==-1) {
                    return reject(`line #1, Ret= -1`);
                }
                if(!/linecount/.test(response[5])){
                    return reject(`line #6, doesn't start with "linecount:", line= ${response[5]}`);
                }
                let count = parseInt(response[5].split(':')[1]);
                if(count +7 != response.length) {
                    return reject(`line #6, size not match, ${count +7} vs ${response.length}`);
                }
                let lastLine = response[response.length - 1];
                if(lastLine != 'endline') {
                    return reject(`line #${response.length - 1}, doesn't equal to "endline", line=${lastLine}`);
                }
                let map = new Map();
                for( let i=6; i< response.length - 1; i++) {
                    let line = response[i];
                    let tokens = line.split(',');
                    let groupby = requestObj.groupby;
                    let key = tokens.slice(0, groupby.length);
                    map.set(key.join(','), tokens.slice(groupby.length));
                }
                resolve(map);
            } catch(e) {
                reject(e);
                logger.error('[TCPClient try]:',e);
            }

        });

        wsClient.on('error', (err) => {
            logger.error('[TCPClient]:',err);
            reject(err);
        });
    });
};






module.exports = TCPClient;