/* eslint-disable import/no-extraneous-dependencies */

import event from 'events';
import util from 'util';
import delay from 'delay';

const produce = jest.fn();
const producerDisconnect = jest.fn(function disconnect() {
  delay(200).then(() => this.emit('disconnected'));
});
const producerConnect = jest.fn(function connect() {
  delay(200).then(() => this.emit('ready'));
});

const Producer = jest.fn();

Producer.prototype.disconnect = producerDisconnect;
Producer.prototype.connect = producerConnect;

Producer.prototype.produce = produce;

util.inherits(Producer, event.EventEmitter);

const consume = jest.fn();
const consumerDisconnect = jest.fn(function disconnect() {
  delay(200).then(() => this.emit('disconnected'));
});

const subscribe = jest.fn(function subscribe(eventsToSubscribeto, handler) {
  const events = this.events || {};

  eventsToSubscribeto.forEach((e) => {
    events[e] = handler;
  });

  this.events = events;
});

const unsubscribe = jest.fn();
const consumerConnect = jest.fn(function connect() {
  delay(200).then(() => this.emit('ready'));
});

const KafkaConsumer = jest.fn();

KafkaConsumer.prototype.disconnect = consumerDisconnect;
KafkaConsumer.prototype.connect = consumerConnect;

KafkaConsumer.prototype.consume = consume;
KafkaConsumer.prototype.subscribe = subscribe;
KafkaConsumer.prototype.unsubscribe = unsubscribe;
KafkaConsumer.prototype.triggerTopic = jest.fn(function triggerTopic(...args) {
  this.emit('data', ...args);
});

util.inherits(KafkaConsumer, event.EventEmitter);

const nodeRdkafka = {
  produce,
  unsubscribe,
  subscribe,
  Producer,
  KafkaConsumer,
  consumerConnect,
  producerConnect,
  producerDisconnect,
  consumerDisconnect,
  consume
};

export default nodeRdkafka;
