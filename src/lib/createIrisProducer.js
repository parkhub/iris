import debug from 'debug';
import serializeMessageToSchemaRegistryAvro from './serializeMessageToSchemaRegistryAvro';

const log = debug('iris:producer:createIrisProducer');
const instanceLog = debug('iris:producer:createIrisProducer:instance');

const producerProto = {
  produce(produceCfgs) {
    const { client, registry } = this;

    instanceLog('Producing new message with %O', produceCfgs);

    const encodedMessage = serializeMessageToSchemaRegistryAvro({
      registry,
      ...produceCfgs
    });

    instanceLog('Serialized message');

    const {
      topic, partition, key, timestamp, oToken
    } = produceCfgs;

    instanceLog('Sending to rdkafka producer');
    client.produce(topic, partition, encodedMessage, key, timestamp, oToken);
  },
  poll() {
    const { client } = this;
    instanceLog('Configuring producer to poll');

    client.poll();
  },
  setPollInterval({ interval }) {
    const { client } = this;
    instanceLog(`Configuring poll interval of ${interval}`);

    client.setPollInterval(interval);
  },
  flush() {
    const { client } = this;
    instanceLog('Flusing producer');

    client.flush();
  }
};

export default function createIrisProducer(cfgs) {
  const { client, registry } = cfgs;

  log('Creating new producer');

  return Object.assign(producerProto, {
    client,
    registry
  });
}
