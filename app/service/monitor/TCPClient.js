/**
 * Tencent is pleased to support the open source community by making Tars available.
 *
 * Copyright (C) 2016THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the BSD 3-Clause License (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * https://opensource.org/licenses/BSD-3-Clause
 *
 * Unless required by applicable law or agreed to in writing, software distributed
 * under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

const net = require('net');
const logger = require('../../logger');
let TCPClient = (ip, port, requestObj) => {
	return new Promise((resolve, reject) => {
		var client = new net.Socket();
		client.connect(port, ip, () => {
			client.write(JSON.stringify(requestObj));
		});
		let data = '';
		client.on('data', (e) => {
			try {
				e = e.toString();
				if (e.indexOf('endline') == -1) {
					data += e;
					return;
				} else {
					data += e.substring(0, e.indexOf('endline') + 7);
				}
				e = data;
				logger.info('TCPClient DATA:', e);
				let response = e.split(/\n/);
				response = response.map((n) => {
					return n.replace(/^\s*|\s*$/g, '').replace(/,$/, '');
				});
				if (!/Ret/.test(response[0])) {
					return reject(`line #1, doesn't start with "Ret:", line = ${response[0]}`);
				}
				let ret = parseInt(response[0].split(':')[1]);
				if (ret == -1) {
					let exception = e.match(/\nret:-1([^\n]*?)\n/);
					exception ? exception = exception[1] : `line #1, Ret= -1`;
					return reject(exception);
				}
				if (!/linecount/.test(response[5])) {
					return reject(`line #6, doesn't start with "linecount:", line= ${response[5]}`);
				}
				let count = parseInt(response[5].split(':')[1]);
				if (count + 7 != response.length) {
					return reject(`line #6, size not match, ${count + 7} vs ${response.length}`);
				}
				let lastLine = response[response.length - 1];
				if (lastLine != 'endline') {
					return reject(`line #${response.length - 1}, doesn't equal to "endline", line=${lastLine}`);
				}
				let map = new Map();
				for (let i = 6; i < response.length - 1; i++) {
					let line = response[i];
					let tokens = line.split(',');
					let groupby = requestObj.groupby;
					let key = tokens.slice(0, groupby.length);
					map.set(key.join(','), tokens.slice(groupby.length));
				}
				resolve(map);
			} catch (e) {
				reject(e);
				logger.error('[TCPClient try]:', e);
			}
			client.destroy();
		});
		client.on('error', (err) => {
			logger.error('[TCPClient]:', err);
			reject(err);
		});
	});
};

module.exports = TCPClient;
