/* @flow */

import kafka from 'node-rdkafka';
import pEvent from 'p-event';
import circeMiddleware from '@parkhub/circe-middleware';
import checkParamsMiddleware from './middleware/checkParamsMiddleware';
import kafkaMessageToBufferMiddleware from './middleware/kafkaMessageToBufferMiddleware';
import timestampMiddleware from './middleware/timestampMiddleware';

type ProducerParameters = {
  connection: string,
  globalCfgs?: Object
};

export default async function createProducer({ connection, globalCfgs = {} }: ProducerParameters) {
  if (!connection) {
    throw new Error('connection is required');
  }

  const defaultCfgs = {
    'metadata.broker.list': connection,
    'broker.version.fallback': '0.10.0', // If kafka node doesn't have API, use this instead
    'api.version.request': true // Request the api version of Kafka node
  };

  const producer = new kafka.Producer({ ...defaultCfgs, ...globalCfgs });

  producer.connect();

  await pEvent(producer, 'ready');

  const producerMiddleware = circeMiddleware([checkParamsMiddleware]);

  return {
    publish({ publishCfgs, middleware = [] }): void {
      middleware.forEach(ware => producerMiddleware.use(ware));
      producerMiddleware.use(kafkaMessageToBufferMiddleware);
      producerMiddleware.use(timestampMiddleware);

      producerMiddleware.run(publishCfgs, (finalPublishCfgs) => {
        const {
          topic, message, partition, timestamp, opaqueToken, key
        } = finalPublishCfgs;

        producer.produce(topic, partition, message, key, timestamp, opaqueToken);
      });
    },
    disconnect(): Promise<*> {
      producer.disconnect();

      return pEvent(producer, 'disconnected');
    },
    addListener(...args): void {
      producer.on(...args);
    }
  };
}
