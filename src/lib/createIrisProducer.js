import debug from 'debug';
import serializeMessageToSchemaRegistryAvro from './serializeMessageToSchemaRegistryAvro';

const log = debug('iris:producer:createIrisProducer');

export default function createIrisProducer(registry) { //overwriting rdkafka
  return (client) => {
    const clientProduce = client.produce.bind(client);

    // eslint-disable-next-line no-param-reassign
    client.produce = (topic, partition, message, key, timestamp, oToken) => {
      log('Producing new message with %O', {
        topic,
        partition,
        message,
        key,
        timestamp,
        oToken
      });

      const encodedMessage = serializeMessageToSchemaRegistryAvro({
        registry,
        message,
        topic
      });

      log('Serialized message');

      log('Sending to rdkafka producer');
      clientProduce(topic, partition, encodedMessage, key, timestamp, oToken);
    };

    return client;
  };
}
