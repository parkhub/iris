import prepareProduceConfiguration from './prepareProduceConfiguration';

const producerProto = {
  produce(produceCfgs) {
    const { client, registry } = this;

    const {
      message, topic, partition, timestamp, oToken, key
    } = prepareProduceConfiguration({
      registry,
      ...produceCfgs
    });

    client.produce(topic, partition, message, key, timestamp, oToken);
  }
};

export default function createIrisProducer(cfgs) {
  const { client, registry } = cfgs;

  return Object.assign(Object.create(producerProto), {
    client,
    registry
  });
}
