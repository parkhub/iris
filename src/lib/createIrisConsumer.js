function wrapConsumerHandler({ handler, registry }) {
  return (data) => {
    const { message: encodedMessage, topic } = data;
    const { schemaType } = registry.getSchemaInfoByTopic({ topic });

    const schemaId = encodedMessage.readInt32BE(1);
    const decodedMessage = schemaType.decode(encodedMessage, 5);

    handler({ message: decodedMessage, topic, schemaId });
  };
}

const consumerProto = {
  subscribe(subscribeCfgs) {
    const { topic, handler } = subscribeCfgs;
    const { client, registry } = this;

    client.subscribe(topic);

    const wrappedHandler = wrapConsumerHandler({ handler, registry });

    client.on('data', wrappedHandler);
  }
};

export default function createIrisProducer(cfgs) {
  const { client, registry } = cfgs;

  return Object.assign(Object.create(consumerProto), {
    client,
    registry
  });
}
