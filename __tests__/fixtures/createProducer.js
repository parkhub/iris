import kafka from 'node-rdkafka';
import pEvent from 'p-event';

export default async function createProducer() {
  const producer = new kafka.Producer({
    'metadata.broker.list': 'kafka:9092',
    'broker.version.fallback': '0.10.0', // If kafka node doesn't have API, use this instead
    'api.version.request': true // Request the api version of Kafka node
  });

  producer.connect();
  await pEvent(producer, 'ready');

  return producer;
}
