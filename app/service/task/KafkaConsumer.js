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
const TaskService = require('./TaskService');
const fs = require('fs');
const path = require('path');

let latestOffset = fs.readFileSync(path.join(__dirname, '/latestOffset.json')) || `{"${kafkaConf.topic}":{"0":0}}`;
latestOffset = JSON.parse(latestOffset);

const KafkaConsumer = {
    list : [],
    maxCount : 100,   // 最大一次发起100个任务
    latestOffset : latestOffset  // 最新的offset
};

const client = new kafka.Client(kafkaConf.zkHost);
const offset = new kafka.Offset(client);

const topics = [
    {topic : kafkaConf.topic, partition : 0}
];

topics.forEach(item => {
    logger.info(latestOffset);
    Object.assign(item, {offset : latestOffset[item.topic][item.partition]});
});

const options = {
    autoCommit : false,
    fetchMaxWaitMs : 1000,
    fromOffset: true,
    fromBeginning: false,
    groupId : 'test-consumer-group',
};

const consumer = new kafka.Consumer(client, topics, options);

KafkaConsumer.consume = () =>{
    consumer.on('message', message => {
        logger.info('message:',message);
        try{
            const param = JSON.parse(message.value);
            KafkaConsumer.list.push(param);
            KafkaConsumer.latestOffset[message.topic] = {};
            KafkaConsumer.latestOffset[message.topic][message.partition] = message.offset + 1;
            consumer.commit(()=> {});
        }catch(e){}
    });

    let list = [];
    setInterval(()=>{
        let i = 0;
        while(i <  Math.min(KafkaConsumer.maxCount, KafkaConsumer.list.length)){
            list.push(KafkaConsumer.list[i]);
            i ++;
        }
        addTasks(list);
        KafkaConsumer.list = KafkaConsumer.list.slice(i);
        list.length = 0;
    }, 100);
};

function addTasks(list) {
    if(!list.length) return;
    list.forEach(item => {
        TaskService.addTask(item);
    });
}

consumer.on('error', err => {
    logger.info('kafka-consumer error:',err);
});

consumer.on('offsetOutOfRange', topic => {
    topic.maxNum = 2;
    offset.fetch([topic], (err, offsets) =>{
        let min = Math.min.apply(null, offsets[topic.topic][topic.partition]);
        consumer.setOffset(topic.topic, topic.partition, min);
    });
});

process.on('SIGINT', () => {
    fs.writeFileSync(path.join(__dirname, '/latestOffset.json'), JSON.stringify(KafkaConsumer.latestOffset));
});

process.on('exit', () => {
    fs.writeFileSync(path.join(__dirname, '/latestOffset.json'), JSON.stringify(KafkaConsumer.latestOffset));
});

module.exports = KafkaConsumer;