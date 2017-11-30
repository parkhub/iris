import wrapConsumerHandler from './wrapConsumerHandler';

export default function createIrisConsumer(registry) {
  return (client) => {
    const clientSubscribe = client.subscribe.bind(client);

    // eslint-disable-next-line no-param-reassign
    client.subscribe = (topic, handler) => {
      clientSubscribe(topic);

      const wrappedHandler = wrapConsumerHandler({ handler, registry });

      client.consume();
      client.on('data', wrappedHandler);
    };

    // eslint-disable-next-line no-param-reassign
    client.getTopicOffsets = (topic, partition, timeout) =>
      new Promise((resolve, reject) =>
        client.queryWatermarkOffsets(topic, partition, timeout, (err, offsets) => {
          if (err) {
            reject(err);
          }

          resolve(offsets);
        }));

    return client;
  };
}
