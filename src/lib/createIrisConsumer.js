import wrapConsumerHandler from './wrapConsumerHandler';

const consumerProto = {
  subscribe(subscribeCfgs) {
    const { topic, handler } = subscribeCfgs;
    const { client, registry } = this;

    client.subscribe(topic);

    const wrappedHandler = wrapConsumerHandler({ handler, registry });

    client.consume();
    client.on('data', wrappedHandler);
  },
  unsubscribe() {
    const { client } = this;

    client.unsubscribe();
  }
};

export default function createIrisConsumer(cfgs) {
  const { client, registry } = cfgs;

  return Object.assign(Object.create(consumerProto), {
    client,
    registry
  });
}
