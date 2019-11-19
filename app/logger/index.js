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

const winston = require('winston');
require('winston-daily-rotate-file');
const stack = require('callsite');
const moment = require('moment');
const webConf = require('../../config/webConf').webConf;
const path = require('path');
const fs = require('fs-extra');
const schedule = require('node-schedule');

const loggerPath = webConf.loggerPath || path.join(__dirname, '../../log');

fs.ensureDirSync(loggerPath);

var timeStamp = () => moment().format('YYYY-MM-DD HH:mm:ss.SSS');

var normalLogger = new winston.Logger({
	level: 'debug',
	transports: [
		new winston.transports.Console({level: 'info'}),
		new winston.transports.DailyRotateFile({
			name: 'info-file',
			filename: path.join(loggerPath, './info.log'),
			datePattern: 'yyyyMMdd.',
			prepend: true,
			localTime: true,
			timestamp: timeStamp,
			level: 'info'
		}),
		new winston.transports.DailyRotateFile({
			name: 'warn-file',
			filename: path.join(loggerPath, './warn.log'),
			datePattern: 'yyyyMMdd.',
			prepend: true,
			localTime: true,
			timestamp: timeStamp,
			level: 'warn'
		}),
		new winston.transports.DailyRotateFile({
			name: 'error-file',
			filename: path.join(loggerPath, './error.log'),
			datePattern: 'yyyyMMdd.',
			prepend: true,
			localTime: true,
			timestamp: timeStamp,
			level: 'error'
		})
	],
	exceptionHandlers: [
		new winston.transports.Console({level: 'error'}),
		new winston.transports.DailyRotateFile({
			filename: path.join(loggerPath, './exceptions.log'),
			datePattern: 'yyyyMMdd.',
			localTime: true,
			timestamp: timeStamp,
			prepend: true
		})
	]
});

var sqlLogger = new winston.Logger({
	level: 'info',
	transports: [
		new winston.transports.DailyRotateFile({
			name: 'sql-info-file',
			filename: path.join(loggerPath, './sql.log'),
			datePattern: 'yyyyMMdd.',
			prepend: true,
			localTime: true,
			timestamp: timeStamp,
			level: 'info'
		}),
	]
});

/**
 * 按照用户配置的日志保留时间自动清理过期日志文件
 */
let logFileKeepDays = webConf.logFileKeepDays || '7';  //默认保留7天日志
let autoClearTime = webConf.autoClearTime || '2';   //默认两点自动清理过期日志
const clearFile = async (logFileKeepDays) => {
	let fileList = await fs.readdir(loggerPath);
	let expireTime = moment(moment().format('YYYYMMDD'), 'YYYYMMDD').valueOf() - parseInt(logFileKeepDays) * 24 * 60 * 60 * 1000;
	fileList.forEach((fileName) => {
		if (/^\d{8}\.\S+\.log$/g.test(fileName)) {
			let dateStr = fileName.slice(0, 8);
			let date = moment(dateStr, 'YYYYMMDD').valueOf();
			if (!isNaN(date) && date < expireTime) {
				fs.remove(path.join(loggerPath, fileName));
			}
		}
	});
};
if (logFileKeepDays && parseInt(logFileKeepDays) > 0) {
	logFileKeepDays = parseInt(logFileKeepDays);
	clearFile(logFileKeepDays);
	autoClearTime = parseInt(autoClearTime);
	if (isNaN(autoClearTime) || autoClearTime < 0 || autoClearTime > 23) {
		autoClearTime = 2;
	}
	schedule.scheduleJob(autoClearTime + ' * * *', () => {
		clearFile(logFileKeepDays);
	})
}


var logger = {
	_formatInfo: (infos) => {
		var stackList = stack() || [];
		var caller = stackList[2];
		var preStr = '';
		if (caller.getFileName) {
			var fileName = caller.getFileName();
			preStr += fileName.substring(fileName.lastIndexOf('/') + 1) + ':';
			preStr += caller.getLineNumber() + '|'
		}
		var content = '';
		infos.forEach((str) => {
			if (str instanceof Error) {    //error类，打出相应的错误信息和堆栈信息
				content += str.stack;
			} else if (Object.prototype.toString.call(str) === '[object Object]' || Object.prototype.toString.call(str) === '[object Array]') {   //对象或数组，则转为string输出
				if (str.request && str.response) {
					preStr = (str.ip || '') + '|' + (str.uid || '') + '|' + preStr;
				} else {
					content += JSON.stringify(str);
				}
			} else {
				content += str;
			}
			content += ' '
		});
		return preStr + content;

	},
	info: (...str) => {
		normalLogger.info(logger._formatInfo(str));
	},
	warn: (...str) => {
		normalLogger.warn(logger._formatInfo(str));
	},
	error: (...str) => {
		normalLogger.error(logger._formatInfo(str));
	},
	sql: (...str) => {
		sqlLogger.info(logger._formatInfo(str));
	}
};

module.exports = logger;