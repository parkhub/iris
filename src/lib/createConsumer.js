/* @flow */

import kafka from 'node-rdkafka';
import pEvent from 'p-event';
import circeMiddleware from '@parkhub/circe-middleware';
import parseBuffersMiddleware from './middleware/parseBuffersMiddleware';

type ConsumerParameters = {
  connection: string,
  groupId: string,
  topicCfgs?: Object,
  globalCfgs?: Object
};

function arrayify(value) {
  return Array.isArray(value) ? value : [value];
}

export default async function createConsumer(consumerParams: ConsumerParameters) {
  const {
    connection, groupId, topicCfgs = {}, globalCfgs = {}
  } = consumerParams;

  if (!connection || !groupId) {
    const missingProp = !connection ? 'connection' : 'groupId';

    throw new Error(`${missingProp} is required`);
  }

  const baseCfgs = {
    'metadata.broker.list': connection,
    'group.id': groupId,
    event_cb: true
  };

  const consumer = new kafka.KafkaConsumer({ ...baseCfgs, ...globalCfgs }, topicCfgs);

  consumer.connect();

  await pEvent(consumer, 'ready');

  return {
    subscribe({ topic }): void {
      if (!topic) {
        throw new Error('topic is required');
      }

      consumer.subscribe(arrayify(topic));
    },
    consume({ handler, middleware = [] }): void {
      if (!handler) {
        throw new Error('handler is required');
      }

      const consumerMiddleware = circeMiddleware([parseBuffersMiddleware]);
      consumer.consume();

      middleware.forEach(ware => consumerMiddleware.use(ware));
      consumer.on('data', data => consumerMiddleware.run(data, handler));
    },
    disconnect(): Promise<*> {
      consumer.disconnect();

      return pEvent(consumer, 'disconnected');
    },
    unsubscribe(): void {
      consumer.unsubscribe();
    },
    addListener(...args): void {
      consumer.on(...args);
    }
  };
}
