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

const kafka = require('kafka-node');
const kafkaConf = require('../../../config/webConf').kafkaConf;
const logger = require('../../logger');
const KafkaDao = require('../../dao/KafkaDao');

const KafkaProducer = {};

const client = new kafka.Client(kafkaConf.zkHost);
const producer = new kafka.Producer(client);

producer.on('ready', () => {
	logger.info('Producer is ready');
});

logger.info('connecting kafka');

KafkaProducer.produce = async (message, cb) => {
	await KafkaDao.addTask({
		topic: kafkaConf.topic,
		partition: 0,
		offset: 0,
		status: 'waiting',
		task_no: JSON.parse(message).task_no,
		message: message
	});

	const payloads = [
		{topic: kafkaConf.topic, messages: message}
	];

	producer.send(payloads, (err, data) => {
		if (!!err) {
			logger.info('producer error:', err);
		}
		cb(data);
	});
};

module.exports = KafkaProducer;