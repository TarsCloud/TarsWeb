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

class MessageQueue {
    constructor (host) {
        this.client = new kafka.Client(host || kafkaConf.host);
        this.topic = kafkaConf.topic;
        this.producer = new kafka.HighLevelProducer(this.client);
        this.consumer = new kafka.Consumer(this.client,[{topic:this.topic, partition: 0}]);

        this.producer.on('ready', ()=> console.info('Producer is ready'));

        this.producer.on('error', err => {
            console.log('Producer is in error state');
            console.log(err);
        })
    }

    setTopic(topic) {
        this.topic = topic;
    }

    getTopic() {
        return this.topic;
    }

    Consumer(opts) {
        return new kafka.ConsumerGroup(opts, this.client);
    }

    addTask(payloads) {
        payloads.map(payload => {
            payload.topic = payload.topic || this.topic;
        });
        return new Promise( (resolve, reject)=> {
            this.producer.send(payloads, (err, data)=> {
                if(err) {
                    reject(err);
                }else {
                    resolve(data);
                }
            })
        });
    }

    getTaskMessage(succ, fail, consumer) {
        consumer = consumer || this.consumer;
        consumer.on('message', (message)=> {
            succ(message);
        });

        consumer.on('error', (err)=> fail(err));
    }
}

module.exports = MessageQueue;