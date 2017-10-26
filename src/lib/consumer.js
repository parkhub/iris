import kafka from 'node-rdkafka';

export default function createRDKConsumer(cfgs) {
  const { consumerCfgs: { brokerUrl, topicCfgs, ...otherConsumerCfgs }, ...otherCfgs } = cfgs;
  const defaultCfgs = {
    'metadata.broker.list': brokerUrl,
    'api.version.request': true
  };

  const rdkConsumer = new kafka.KafkaConsumer({ ...defaultCfgs, otherConsumerCfgs }, topicCfgs);

  return {
    client: rdkConsumer,
    ...otherCfgs
  };
}
