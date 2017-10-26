import prepareProduceConfiguration from './prepareProduceConfiguration';

const producerProto = {
  produce(produceCfgs) {
    const { client, registry } = this;

    const encodedMessage = prepareProduceConfiguration({
      registry,
      ...produceCfgs
    });

    const {
      topic, partition, key, timestamp, oToken
    } = produceCfgs;

    client.produce(topic, partition, encodedMessage, key, timestamp, oToken);
  }
};

export default function createIrisProducer(cfgs) {
  const { client, registry } = cfgs;

  return Object.assign(Object.create(producerProto), {
    client,
    registry
  });
}
