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