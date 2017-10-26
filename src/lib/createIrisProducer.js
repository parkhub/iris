import serializeMessageToSchemaRegistryAvro from './serializeMessageToSchemaRegistryAvro';

const producerProto = {
  produce(produceCfgs) {
    const { client, registry } = this;

    const encodedMessage = serializeMessageToSchemaRegistryAvro({
      registry,
      ...produceCfgs
    });

    const {
      topic, partition, key, timestamp, oToken
    } = produceCfgs;

    client.produce(topic, partition, encodedMessage, key, timestamp, oToken);
  },
  poll() {
    const { client } = this;

    client.poll();
  },
  setPollInterval({ interval }) {
    const { client } = this;

    client.setPollInterval(interval);
  },
  flush() {
    const { client } = this;

    client.flush();
  }
};

export default function createIrisProducer(cfgs) {
  const { client, registry } = cfgs;

  return Object.assign(Object.create(producerProto), {
    client,
    registry
  });
}
